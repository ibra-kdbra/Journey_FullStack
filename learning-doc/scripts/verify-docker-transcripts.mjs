#!/usr/bin/env node
/**
 * Replays every shell transcript in the Docker course against a real Docker
 * daemon and fails if a command prints anything other than what the lesson
 * shows. The Docker counterpart of verify-redis-transcripts.mjs and
 * verify-psql-transcripts.mjs.
 *
 * Two kinds of fenced block take part:
 *
 * - A transcript: a block whose first non-blank line starts with `$ `. Each
 *   `$ ` line is a command; a command line ending in a backslash continues on
 *   the next line, which starts with `> ` as it would in a shell. Everything
 *   else is the output the command must print, stdout and stderr merged as a
 *   terminal shows them.
 * - A file: a block whose info string carries a `[path]`, such as
 *   ```dockerfile [hello/Dockerfile]. Its contents are written to that path,
 *   relative to the lesson's working directory, when the block is reached, so
 *   a lesson builds exactly the files it shows.
 *
 * A container's stdout and stderr reach the terminal through separate streams,
 * and Docker does not preserve their relative order, so a transcript must not
 * depend on how lines from the two interleave.
 *
 * Output is compared line by line after trimming trailing whitespace. The one
 * allowance is `[...]`, which matches any text within a single line. It exists
 * for values Docker generates at random - container IDs, image digests of
 * local builds - and a lesson should use it only there, saying so. Anything
 * else that is not reproducible (timestamps, pull progress, `docker ps`
 * columns such as "Up 2 seconds") belongs out of the transcript: use
 * `--format`, `-q`, or `docker pull -q` before a `docker run`.
 *
 * Each lesson runs in a fresh temporary directory, in one `bash` session fed a
 * command at a time, so `cd`, variables and `$?` carry from one command to
 * the next exactly as in a reader's shell. Lessons are
 * isolated from each other and from the rest of the daemon: containers,
 * volumes and networks that did not exist before a lesson started are removed
 * when it ends. Images are not removed (see restore()): lessons give theirs
 * distinct names, and an image is pulled once, in the lesson that introduces
 * it, as it would be for a reader following along - so lessons run in order.
 * Anything that existed before is never touched, but a lesson that names a
 * container `web` will fail if you already run one called `web`. Remove the
 * lessons' images afterwards with `docker image prune` and `docker rmi`.
 *
 * Usage: node scripts/verify-docker-transcripts.mjs [lesson.md ...]
 * Needs a running Docker daemon with network access to Docker Hub, and the
 * compose plugin. Exits 0 when every transcript matches.
 */

import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const courseDir = join(here, '..', 'content', 'courses', 'docker')

const ENV = {
  ...process.env,
  // Keep the CLI's output to what the command itself prints.
  DOCKER_CLI_HINTS: 'false',
  NO_COLOR: '1',
  TERM: 'dumb',
  COLUMNS: '200',
  LC_ALL: 'C.UTF-8',
  TZ: 'UTC',
}

// ---------------------------------------------------------------------------
// Parsing: the lesson as an ordered list of file blocks and transcripts.

function steps(markdown) {
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
function commands(body) {
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

const trimLines = (lines) => {
  const out = lines.map((l) => l.trimEnd())
  while (out.length && out[out.length - 1] === '') out.pop()
  return out
}

function lineMatches(expected, actual) {
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
class Shell {
  constructor(cwd) {
    this.token = `__done_${randomBytes(8).toString('hex')}__`
    this.proc = spawn('bash', ['--noprofile', '--norc'], { cwd, env: ENV })
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

const docker = (...args) =>
  execFileSync('docker', args, { encoding: 'utf8', env: ENV, stdio: ['ignore', 'pipe', 'ignore'] })
    .split('\n')
    .filter(Boolean)

function snapshot() {
  return {
    containers: new Set(docker('ps', '-aq', '--no-trunc')),
    images: new Set(docker('image', 'ls', '-aq', '--no-trunc')),
    volumes: new Set(docker('volume', 'ls', '-q')),
    networks: new Set(docker('network', 'ls', '-q', '--no-trunc')),
  }
}

// Remove whatever the lesson created, leaving what existed before alone.
function restore(before) {
  const after = snapshot()
  const added = (kind) => [...after[kind]].filter((x) => !before[kind].has(x))
  const quietly = (args) => spawnSync('docker', args, { env: ENV, stdio: 'ignore' })
  const containers = added('containers')
  if (containers.length) quietly(['rm', '-f', '-v', ...containers])
  const networks = added('networks')
  if (networks.length) quietly(['network', 'rm', ...networks])
  const volumes = added('volumes')
  if (volumes.length) quietly(['volume', 'rm', '-f', ...volumes])
  // Images are left in place, pulled or built. Removing a built image while
  // BuildKit's cache still refers to its layers makes a later build that hits
  // that cache fail with "parent snapshot ... does not exist" - it did, in one
  // run out of five, before this was changed. Build cache cannot be pruned per
  // lesson without pruning everyone's, so lessons give their images distinct
  // names instead, and nothing a lesson checks depends on an image's absence.
}

function diagnose(before) {
  const lines = ['containers created by this lesson:']
  for (const id of snapshot().containers) {
    if (before.containers.has(id)) continue
    const state = spawnSync('docker', ['inspect', '--format', '{{.Name}} {{.State.Status}} exit={{.State.ExitCode}} {{.State.Error}}', id], { env: ENV, encoding: 'utf8' })
    lines.push(`  ${state.stdout.trim()}`)
    const logs = spawnSync('docker', ['logs', '--tail', '20', id], { env: ENV, encoding: 'utf8' })
    for (const l of (logs.stdout + logs.stderr).trim().split('\n')) if (l) lines.push(`    | ${l}`)
    // For a container that is running but not answering, what it resolves
    // and what it listens on usually explains why.
    const inside = spawnSync('docker', ['exec', id, 'sh', '-c', 'echo "/etc/hosts:"; cat /etc/hosts; echo "listening:"; netstat -ltn 2>/dev/null || cat /proc/net/tcp /proc/net/tcp6 2>/dev/null'], { env: ENV, encoding: 'utf8' })
    if (inside.status === 0) for (const l of inside.stdout.trim().split('\n')) if (l) lines.push(`    : ${l}`)
  }
  return lines.join('\n')
}

// Run one lesson and return, for every transcript, the text docker printed.
async function runLesson(file) {
  const before = snapshot()
  const root = mkdtempSync(join(tmpdir(), 'docker-lesson-'))
  const shell = new Shell(root)
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
          // A command that never finishes - typically a readiness loop whose
          // container has died - says nothing about why. Show the state and
          // the last lines of output of every container this lesson created.
          throw new Error(`${e.message}\n\n${diagnose(before)}`)
        }
        printed.push({ cmd, actual: trimLines(actual.split('\n')) })
      }
      results.push({ step, printed })
    }
  } finally {
    shell.close()
    restore(before)
    rmSync(root, { recursive: true, force: true })
  }
  return results
}

async function verifyFile(file) {
  const results = await runLesson(file)
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

async function main() {
  const files = process.argv.slice(2).length
    ? process.argv.slice(2)
    : readdirSync(courseDir)
        .filter((f) => f.endsWith('.md'))
        .sort((a, b) => (parseInt(a.match(/\d+/)) || 0) - (parseInt(b.match(/\d+/)) || 0))
        .map((f) => join(courseDir, f))

  let version
  try {
    version = docker('version', '--format', '{{.Server.Version}}')[0]
  } catch {
    console.error('cannot reach a Docker daemon: start one, or check DOCKER_HOST')
    process.exit(2)
  }
  console.log(`Replaying transcripts against Docker Engine ${version}\n`)

  let failed = 0
  let total = 0
  for (const file of files) {
    const name = relative(process.cwd(), file)
    const { transcripts, count, failures } = await verifyFile(file)
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
      console.log('      docker printed:')
      for (const l of f.actual.length ? f.actual : ['<no output>']) console.log(`      < ${l}`)
    }
    console.log()
  }

  console.log(failed ? `\n${failed} command(s) do not match.` : `\nAll ${total} commands match.`)
  process.exit(failed ? 1 : 0)
}

export { steps, commands, runLesson, lineMatches, trimLines }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e.message ?? e)
    process.exit(2)
  })
}
