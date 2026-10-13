/**
 * The engine shared by the verifiers whose courses are taught at a shell
 * prompt - verify-docker-transcripts.mjs and verify-go-transcripts.mjs. Each
 * of those supplies the course directory, the environment and any setup or
 * clean-up specific to its tool; everything else lives here.
 *
 * Two kinds of fenced block take part:
 *
 * - A transcript: a block whose first non-blank line starts with `$ `. Each
 *   `$ ` line is a command; a command line ending in a backslash continues on
 *   the next line, which starts with `> ` as it would in a shell. Everything
 *   else is the output the command must print, stdout and stderr merged as a
 *   terminal shows them.
 * - A file: a block whose info string carries a `[path]`, such as
 *   ```go [hello/main.go]. Its contents are written to that path, relative to
 *   the lesson's working directory, when the block is reached, so a lesson
 *   runs exactly the files it shows.
 *
 * Output is compared line by line after trimming trailing whitespace. The one
 * allowance is `[...]`, which matches any text within a single line; a lesson
 * uses it only for values that are random by design, and says so.
 *
 * Each lesson runs in a fresh temporary directory, in one `bash` session fed a
 * command at a time, so `cd`, variables and `$?` carry from one command to the
 * next exactly as in a reader's shell. stdin is /dev/null, so a command that
 * reads input cannot hang a run.
 */

import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'

// ---------------------------------------------------------------------------
// Parsing: the lesson as an ordered list of file blocks and transcripts.

export function steps(markdown) {
  const out = []
  const lines = markdown.split('\n')
  let fence = null
  let info = ''
  let body = []
  let startLine = 0
  lines.forEach((line, idx) => {
    const m = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/)
    if (!fence && m) {
      fence = m[2]
      info = m[3].trim()
      body = []
      startLine = idx + 2
    } else if (fence && line.trimStart().startsWith(fence) && line.trim() === fence) {
      const file = info.match(/\[([^\]]+)\]/)
      const first = body.find((l) => l.trim() !== '')
      if (file) out.push({ kind: 'file', path: file[1], content: body.join('\n') + '\n', startLine })
      else if (first && first.startsWith('$ ')) out.push({ kind: 'transcript', body, startLine })
      fence = null
    } else if (fence) {
      body.push(line)
    }
  })
  return out
}

// Split a transcript into commands, each with the output lines that follow it.
export function commands(body) {
  const cmds = []
  let cur = null
  let continuing = false
  for (const line of body) {
    if (continuing && line.startsWith('> ')) {
      cur.text += '\n' + line.slice(2)
      cur.shown.push(line)
      continuing = line.endsWith('\\')
    } else if (line.startsWith('$ ')) {
      cur = { text: line.slice(2), shown: [line], expected: [] }
      cmds.push(cur)
      continuing = line.endsWith('\\')
    } else {
      continuing = false
      cur.expected.push(line)
    }
  }
  return cmds
}

export const trimLines = (lines) => {
  const out = lines.map((l) => l.trimEnd())
  while (out.length && out[out.length - 1] === '') out.pop()
  return out
}

export function lineMatches(expected, actual) {
  if (!expected.includes('[...]')) return expected === actual
  const pattern = expected
    .split('[...]')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*?')
  return new RegExp(`^${pattern}$`).test(actual)
}

// ---------------------------------------------------------------------------
// Execution.

// One bash per lesson, fed one command at a time, so that everything a
// reader's shell would carry from one command to the next carries here too:
// the working directory, variables, and `$?`. After each command the shell
// prints a marker with a random token and the command's exit status; the
// output is everything before the marker.
export class Shell {
  constructor(cwd, env) {
    this.token = `__done_${randomBytes(8).toString('hex')}__`
    this.proc = spawn('bash', ['--noprofile', '--norc'], { cwd, env })
    this.buf = ''
    this.proc.stdout.on('data', (d) => (this.buf += d.toString('utf8')))
    this.proc.stderr.on('data', (d) => (this.buf += d.toString('utf8')))
    this.proc.stdin.write('set -o pipefail; __status=0\n')
  }

  run(command, timeoutMs = 120000) {
    // stdin is /dev/null so a command that reads input cannot hang the run;
    // `(exit $__status)` restores the previous command's status for `$?`.
    this.proc.stdin.write(
      `(exit $__status); {\n${command}\n} </dev/null 2>&1\n` +
        `__status=$?; printf '\\n%s %s\\n' ${this.token} "$__status"\n`,
    )
    const marker = new RegExp(`\\n${this.token} (\\d+)\\n`)
    return new Promise((resolvePromise, reject) => {
      const started = Date.now()
      const tick = () => {
        const m = this.buf.match(marker)
        if (m) {
          const output = this.buf.slice(0, m.index)
          this.buf = this.buf.slice(m.index + m[0].length)
          return resolvePromise(output)
        }
        if (Date.now() - started > timeoutMs) return reject(new Error(`command timed out: ${command}`))
        setTimeout(tick, 5)
      }
      tick()
    })
  }

  close() {
    this.proc.stdin.end('exit\n')
  }
}

/**
 * Run one lesson and return, for every transcript, what each command printed.
 *
 * hooks.before() runs before the lesson and returns a state value, which is
 * passed to hooks.after(state) - always called, even on failure - and to
 * hooks.diagnose(state), whose text is appended when a command times out.
 */
export async function runLesson(file, { env, tmpPrefix = 'lesson-', hooks = {} }) {
  const state = hooks.before ? hooks.before() : undefined
  const root = mkdtempSync(join(tmpdir(), tmpPrefix))
  const shell = new Shell(root, env)
  const results = []
  try {
    for (const step of steps(readFileSync(file, 'utf8'))) {
      if (step.kind === 'file') {
        const target = resolve(root, step.path)
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, step.content)
        continue
      }
      const printed = []
      for (const cmd of commands(step.body)) {
        let actual
        try {
          actual = await shell.run(cmd.text)
        } catch (e) {
          const extra = hooks.diagnose ? `\n\n${hooks.diagnose(state)}` : ''
          throw new Error(`${e.message}${extra}`)
        }
        printed.push({ cmd, actual: trimLines(actual.split('\n')) })
      }
      results.push({ step, printed })
    }
  } finally {
    shell.close()
    if (hooks.after) hooks.after(state)
    rmSync(root, { recursive: true, force: true })
  }
  return results
}

export async function verifyFile(file, options) {
  const results = await runLesson(file, options)
  const failures = []
  let count = 0
  for (const { step, printed } of results) {
    let offset = 0
    for (const { cmd, actual } of printed) {
      count++
      const expected = trimLines(cmd.expected)
      const ok = expected.length === actual.length && expected.every((e, i) => lineMatches(e, actual[i]))
      if (!ok) {
        let i = 0
        while (i < Math.min(expected.length, actual.length) && lineMatches(expected[i], actual[i])) i++
        failures.push({
          lineNo: step.startLine + offset,
          command: cmd.shown,
          expected: expected.slice(i, i + 6),
          actual: actual.slice(i, i + 6),
        })
      }
      offset += cmd.shown.length + cmd.expected.length
    }
  }
  return { transcripts: results.length, count, failures }
}

// Lesson files in a course directory, in lesson order.
export const lessonFiles = (courseDir) =>
  readdirSync(courseDir)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => (parseInt(a.match(/\d+/)) || 0) - (parseInt(b.match(/\d+/)) || 0))
    .map((f) => join(courseDir, f))

// Verify the given lessons (or the whole course), print a report, and exit.
export async function runCourse({ courseDir, files, printedBy, ...options }) {
  const targets = files.length ? files : lessonFiles(courseDir)
  let failed = 0
  let total = 0
  for (const file of targets) {
    const name = relative(process.cwd(), file)
    const { transcripts, count, failures } = await verifyFile(file, options)
    total += count
    if (!failures.length) {
      console.log(`  ok    ${name}  (${transcripts} transcripts, ${count} commands)`)
      continue
    }
    failed += failures.length
    console.log(`  FAIL  ${name}`)
    for (const f of failures) {
      console.log(`\n    line ${f.lineNo}: ${f.command.join('\n      ')}`)
      console.log('      lesson shows:')
      for (const l of f.expected.length ? f.expected : ['<no output>']) console.log(`      > ${l}`)
      console.log(`      ${printedBy} printed:`)
      for (const l of f.actual.length ? f.actual : ['<no output>']) console.log(`      < ${l}`)
    }
    console.log()
  }
  console.log(failed ? `\n${failed} command(s) do not match.` : `\nAll ${total} commands match.`)
  process.exit(failed ? 1 : 0)
}
