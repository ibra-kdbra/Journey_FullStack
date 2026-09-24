#!/usr/bin/env node
/**
 * Replays every psql transcript in the Supabase course through a real,
 * interactive psql session and fails if the session does not print exactly
 * what the lesson shows. The SQL counterpart of verify-redis-transcripts.mjs,
 * for the same reason: course material is where a wrong claim gets taught.
 *
 * What counts as a transcript: any fenced block whose first non-blank line
 * starts with a psql prompt (`postgres=# `, `postgres=> `, `postgres=*# `...).
 * Every prompted line is input; everything else is output. There is no
 * opt-out: output that is not reproducible - random UUIDs, now(), unordered
 * rows - does not belong in a transcript.
 *
 * psql is run interactively, under a pseudo-terminal provided by script(1),
 * rather than fed from a pipe. That is deliberate. Piped psql prints no
 * prompts at all, and psql's prompt carries information a lesson relies on:
 * `=*#` inside a transaction block, `=!#` after an error inside one, `=>`
 * once SET ROLE has dropped superuser, `$#` inside a dollar-quoted function
 * body. Reimplementing those rules is exactly the kind of guess this script
 * exists to rule out, so psql draws its own prompts and the whole transcript
 * - prompts, echoed input and output - is compared verbatim. Each line is
 * sent only once psql has printed its next prompt, the way a person types.
 *
 * Lessons are cumulative, unlike the Redis course: the course builds one
 * schema across lessons, as a reader following it in one database would.
 * So lessons run in order against one database, each in a fresh psql
 * session - session state such as SET ROLE ends with the lesson, the schema
 * carries on.
 *
 * The script creates its own throwaway cluster with initdb in a temp
 * directory - unix socket only, fsync off, wal_level=logical for the
 * Realtime lesson, UTC, C.UTF-8, autovacuum off so no background ANALYZE
 * can change a query plan between two lines of a transcript - and removes
 * it afterwards. It never connects to a PostgreSQL you already run. initdb
 * refuses to run as root, so neither does this.
 *
 * Usage: node scripts/verify-psql-transcripts.mjs [lesson.md ...]
 * Needs PostgreSQL 16's server binaries (initdb, pg_ctl, psql), the wal2json
 * output plugin, and script(1).
 * Exits 0 when every transcript matches.
 */

import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const courseDir = join(here, '..', 'content', 'courses', 'supabase')
const DB = 'postgres'

// psql's default PROMPT1 and PROMPT2 are both '%/%R%x%# ': database name,
// a state character, a transaction marker, then # for superuser or > not.
const PROMPT_LINE = new RegExp(`^${DB}[=\\-'"$(*@^!][*!?]?[#>] `)
const PROMPT_AT_END = new RegExp(`(?:^|\\n)${DB}[=\\-'"$(*@^!][*!?]?[#>] $`)

// ---------------------------------------------------------------------------
// Transcript extraction.

function transcripts(markdown) {
  const blocks = []
  const lines = markdown.split('\n')
  let fence = null
  let body = []
  let startLine = 0
  lines.forEach((line, idx) => {
    const m = line.match(/^(\s*)(`{3,}|~{3,})/)
    if (!fence && m) {
      fence = m[2]
      body = []
      startLine = idx + 2
    } else if (fence && line.trimStart().startsWith(fence)) {
      const first = body.find((l) => l.trim() !== '')
      if (first && PROMPT_LINE.test(first)) blocks.push({ startLine, body })
      fence = null
    } else if (fence) {
      body.push(line)
    }
  })
  return blocks
}

// The lines a reader types: every prompted line, minus its prompt.
function inputs(block) {
  return block.body
    .filter((l) => PROMPT_LINE.test(l))
    .map((l) => l.replace(PROMPT_LINE, ''))
}

const normalise = (text) => {
  const lines = text.split('\n').map((l) => l.trimEnd())
  while (lines.length && lines[lines.length - 1] === '') lines.pop()
  while (lines.length && lines[0] === '') lines.shift()
  return lines
}

// ---------------------------------------------------------------------------
// Cluster lifecycle.

// The course is verified against one major version: EXPLAIN output and some
// messages change between majors, so a newer server installed alongside is
// not silently used instead. PG_BINDIR overrides the search.
const PG_MAJOR = '16'

function binDir() {
  const candidates = [
    process.env.PG_BINDIR,
    `/usr/lib/postgresql/${PG_MAJOR}/bin`,
  ]
  try {
    candidates.push(execFileSync('pg_config', ['--bindir'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim())
  } catch {}
  const found = candidates.find((d) => d && existsSync(join(d, 'initdb')))
  if (found) return found
  throw new Error(`cannot find initdb: install PostgreSQL ${PG_MAJOR}'s server binaries, or set PG_BINDIR`)
}

function startCluster() {
  if (process.getuid && process.getuid() === 0) {
    throw new Error('initdb refuses to run as root; run this script as an ordinary user')
  }
  const bin = binDir()
  const dir = mkdtempSync(join(tmpdir(), 'psql-lessons-'))
  const data = join(dir, 'data')
  const quiet = { stdio: 'ignore' }
  execFileSync(join(bin, 'initdb'), [
    '-D', data, '-U', 'postgres', '-A', 'trust',
    '--encoding=UTF8', '--locale=C.UTF-8', '--no-instructions',
  ], quiet)
  execFileSync(join(bin, 'pg_ctl'), [
    '-D', data, '-l', join(dir, 'server.log'), '-w', 'start', '-o',
    `-c listen_addresses='' -k ${dir} -c fsync=off -c wal_level=logical ` +
      '-c max_replication_slots=4 -c max_wal_senders=4 -c TimeZone=UTC -c autovacuum=off',
  ], quiet)
  return {
    bin,
    socketDir: dir,
    stop() {
      try { execFileSync(join(bin, 'pg_ctl'), ['-D', data, '-m', 'immediate', 'stop'], quiet) } catch {}
      rmSync(dir, { recursive: true, force: true })
    },
  }
}

// ---------------------------------------------------------------------------
// An interactive psql session, typed into one line at a time.

const stripTerminal = (s) =>
  s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').replace(/\x1b[=>]/g, '').replace(/\r/g, '')

class Session {
  constructor(cluster) {
    const psql = join(cluster.bin, 'psql')
    // A very wide terminal so readline never wraps or scrolls a long line,
    // and the pager off so result sets are printed rather than paged.
    const cmd = `stty cols 4000 -echoctl; exec "${psql}" -X -P pager=off -h "${cluster.socketDir}" -d ${DB}`
    this.proc = spawn('script', ['-q', '-c', cmd, '/dev/null'], {
      env: { ...process.env, TERM: 'dumb', PGTZ: 'UTC', PGCLIENTENCODING: 'UTF8', LC_ALL: 'C.UTF-8' },
    })
    this.raw = ''
    this.proc.stdout.on('data', (d) => (this.raw += d.toString('utf8')))
  }

  // Resolve with everything printed up to and including psql's next prompt.
  nextPrompt(timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const started = Date.now()
      const tick = () => {
        const text = stripTerminal(this.raw)
        if (PROMPT_AT_END.test(text)) {
          this.raw = ''
          return resolve(text)
        }
        if (Date.now() - started > timeoutMs) {
          return reject(new Error(`psql printed no prompt within ${timeoutMs} ms; last output:\n${text.slice(-500)}`))
        }
        setTimeout(tick, 2)
      }
      tick()
    })
  }

  async start() {
    const banner = await this.nextPrompt()
    return banner.split('\n').pop() // the first prompt, without psql's banner
  }

  async type(line) {
    this.proc.stdin.write(line + '\n')
    return this.nextPrompt()
  }

  close() {
    this.proc.stdin.end('\\q\n')
  }
}

// ---------------------------------------------------------------------------

async function verifyFile(file, cluster) {
  const md = readFileSync(file, 'utf8')
  const blocks = transcripts(md)
  const failures = []
  let count = 0
  const session = new Session(cluster)
  try {
    let prompt = await session.start()
    for (const block of blocks) {
      let text = prompt
      for (const line of inputs(block)) {
        count++
        text += await session.type(line)
      }
      // The trailing prompt belongs to whatever the reader types next.
      const cut = text.lastIndexOf('\n')
      prompt = text.slice(cut + 1)
      const actual = normalise(text.slice(0, cut))
      const expected = normalise(block.body.join('\n'))
      if (actual.join('\n') !== expected.join('\n')) {
        let i = 0
        while (i < Math.min(actual.length, expected.length) && actual[i] === expected[i]) i++
        failures.push({
          lineNo: block.startLine + i,
          context: expected.slice(Math.max(0, i - 2), i),
          expected: expected.slice(i, i + 6),
          actual: actual.slice(i, i + 6),
        })
      }
    }
  } finally {
    session.close()
  }
  return { blocks: blocks.length, count, failures }
}

async function main() {
  const files = process.argv.slice(2).length
    ? process.argv.slice(2)
    : readdirSync(courseDir)
        .filter((f) => f.endsWith('.md'))
        .sort((a, b) => (parseInt(a.match(/\d+/)) || 0) - (parseInt(b.match(/\d+/)) || 0))
        .map((f) => join(courseDir, f))

  const cluster = startCluster()
  let failed = 0
  let total = 0
  try {
    const version = execFileSync(join(cluster.bin, 'postgres'), ['--version'], { encoding: 'utf8' }).trim()
    console.log(`Replaying transcripts through an interactive psql against ${version}\n`)

    for (const file of files) {
      const name = relative(process.cwd(), file)
      const { blocks, count, failures } = await verifyFile(file, cluster)
      total += count
      if (!failures.length) {
        console.log(`  ok    ${name}  (${blocks} transcripts, ${count} lines typed)`)
        continue
      }
      failed += failures.length
      console.log(`  FAIL  ${name}`)
      for (const f of failures) {
        console.log(`\n    first difference at line ${f.lineNo}`)
        for (const l of f.context) console.log(`        ${l}`)
        console.log('      lesson shows:')
        for (const l of f.expected.length ? f.expected : ['<end of transcript>']) console.log(`      > ${l}`)
        console.log('      psql printed:')
        for (const l of f.actual.length ? f.actual : ['<end of transcript>']) console.log(`      < ${l}`)
      }
      console.log()
    }
  } finally {
    cluster.stop()
  }

  console.log(
    failed
      ? `\n${failed} transcript(s) do not match what psql printed.`
      : `\nAll ${total} typed lines produce exactly the transcripts shown.`,
  )
  process.exit(failed ? 1 : 0)
}

export { transcripts, inputs, normalise, startCluster, Session, PROMPT_LINE, DB }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e.message ?? e)
    process.exit(2)
  })
}
