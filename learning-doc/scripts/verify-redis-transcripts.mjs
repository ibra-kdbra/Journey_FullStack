#!/usr/bin/env node
/**
 * Replays every redis-cli transcript in the Redis course against a real
 * redis-server and fails if any shown reply differs from what the server
 * actually returns.
 *
 * Course material is the one place in this repository where a wrong claim is
 * taught rather than merely run. A transcript that shows `(integer) 3` where
 * Redis says `(integer) 2` is worse than no transcript, because a learner
 * trusts it. So a transcript is not illustration here: it is a test.
 *
 * What counts as a transcript: any fenced block whose first non-blank line
 * starts with the redis-cli prompt `127.0.0.1:6379> `. There is deliberately
 * no opt-out. Output that is not reproducible - timings, random members,
 * unordered set replies - does not belong in a transcript; describe it in
 * prose instead.
 *
 * Inside a transcript:
 *   127.0.0.1:6379> CMD args   a command, parsed with redis-cli's own quoting
 *   <anything else>            the expected reply, formatted as redis-cli does
 *   # wait 1100ms              pause, so expiry can be shown happening
 *   # ...                      any other `#` line is a comment for the reader
 *
 * Each lesson file runs on one fresh connection against an empty database,
 * in order, so state carries from block to block within a lesson and never
 * between lessons. Connection-scoped state (MULTI, WATCH) therefore behaves
 * exactly as it would for a reader typing into one redis-cli session. Server
 * configuration is isolated the same way: anything a lesson changes with
 * CONFIG SET is put back before the next lesson starts, and loaded scripts
 * and functions are flushed.
 *
 * The script starts its own throwaway redis-server on a unix socket in a temp
 * directory - persistence off, no TCP port - and never connects to a server
 * you already run, because every lesson begins with FLUSHALL.
 *
 * Usage: node scripts/verify-redis-transcripts.mjs [lesson.md ...]
 * Needs `redis-server` on PATH. Exits 0 when every transcript matches.
 */

import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, existsSync } from 'node:fs'
import { createConnection } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const PROMPT = '127.0.0.1:6379> '
const here = dirname(fileURLToPath(import.meta.url))
const courseDir = join(here, '..', 'content', 'courses', 'redis')

// ---------------------------------------------------------------------------
// Command-line parsing: a port of redis-cli's sdssplitargs(), so a command in
// a lesson means exactly what it would mean typed at the real prompt.

function splitArgs(line) {
  const args = []
  let i = 0
  const hex = (c) => /[0-9a-fA-F]/.test(c)
  while (true) {
    while (i < line.length && /\s/.test(line[i])) i++
    if (i >= line.length) return args
    let cur = ''
    let inDq = false
    let inSq = false
    while (true) {
      const c = line[i]
      if (inDq) {
        if (c === undefined) throw new Error(`unbalanced double quote in: ${line}`)
        if (c === '\\' && line[i + 1] === 'x' && hex(line[i + 2]) && hex(line[i + 3])) {
          cur += String.fromCharCode(parseInt(line.slice(i + 2, i + 4), 16))
          i += 3
        } else if (c === '\\' && line[i + 1] !== undefined) {
          i++
          const map = { n: '\n', r: '\r', t: '\t', b: '\b', a: '\x07' }
          cur += map[line[i]] ?? line[i]
        } else if (c === '"') {
          if (line[i + 1] !== undefined && !/\s/.test(line[i + 1])) {
            throw new Error(`closing quote must be followed by a space in: ${line}`)
          }
          inDq = false
          i++
          break
        } else {
          cur += c
        }
      } else if (inSq) {
        if (c === undefined) throw new Error(`unbalanced single quote in: ${line}`)
        if (c === '\\' && line[i + 1] === "'") {
          i++
          cur += "'"
        } else if (c === "'") {
          if (line[i + 1] !== undefined && !/\s/.test(line[i + 1])) {
            throw new Error(`closing quote must be followed by a space in: ${line}`)
          }
          inSq = false
          i++
          break
        } else {
          cur += c
        }
      } else {
        if (c === undefined || /\s/.test(c)) break
        if (c === '"') inDq = true
        else if (c === "'") inSq = true
        else cur += c
      }
      i++
    }
    args.push(cur)
  }
}

// ---------------------------------------------------------------------------
// RESP2 client - just enough to send a command and read one full reply.

function encodeCommand(args) {
  let out = `*${args.length}\r\n`
  for (const a of args) {
    const buf = Buffer.from(a, 'latin1')
    out += `$${buf.length}\r\n${a}\r\n`
  }
  return Buffer.from(out, 'latin1')
}

class Conn {
  constructor(path) {
    this.sock = createConnection(path)
    this.buf = Buffer.alloc(0)
    this.waiters = []
    this.sock.on('data', (d) => {
      this.buf = Buffer.concat([this.buf, d])
      this.pump()
    })
    this.ready = new Promise((res, rej) => {
      this.sock.once('connect', res)
      this.sock.once('error', rej)
    })
  }

  // Returns [reply, bytesConsumed] or null when the buffer holds a partial reply.
  parse(pos = 0) {
    const nl = this.buf.indexOf('\r\n', pos)
    if (nl === -1) return null
    const type = String.fromCharCode(this.buf[pos])
    const line = this.buf.toString('latin1', pos + 1, nl)
    const next = nl + 2
    switch (type) {
      case '+': return [{ t: 'status', v: line }, next]
      case '-': return [{ t: 'error', v: line }, next]
      case ':': return [{ t: 'int', v: line }, next]
      case '$': {
        const len = parseInt(line, 10)
        if (len === -1) return [{ t: 'nil' }, next]
        if (this.buf.length < next + len + 2) return null
        return [{ t: 'bulk', v: this.buf.toString('latin1', next, next + len) }, next + len + 2]
      }
      case '*': {
        const n = parseInt(line, 10)
        if (n === -1) return [{ t: 'nil' }, next]
        const items = []
        let p = next
        for (let k = 0; k < n; k++) {
          const r = this.parse(p)
          if (!r) return null
          items.push(r[0])
          p = r[1]
        }
        return [{ t: 'array', v: items }, p]
      }
      default:
        throw new Error(`unexpected RESP type byte ${JSON.stringify(type)}`)
    }
  }

  pump() {
    while (this.waiters.length) {
      const r = this.parse(0)
      if (!r) return
      this.buf = this.buf.subarray(r[1])
      this.waiters.shift()(r[0])
    }
  }

  send(args) {
    return new Promise((res) => {
      this.waiters.push(res)
      this.sock.write(encodeCommand(args))
    })
  }

  close() {
    this.sock.end()
  }
}

// ---------------------------------------------------------------------------
// Reply formatting: a port of redis-cli's non-raw output (cliFormatReplyTTY),
// which is what a reader sees at the interactive prompt.

function repr(s) {
  let out = '"'
  for (const ch of s) {
    const c = ch.charCodeAt(0)
    if (ch === '\\') out += '\\\\'
    else if (ch === '"') out += '\\"'
    else if (ch === '\n') out += '\\n'
    else if (ch === '\r') out += '\\r'
    else if (ch === '\t') out += '\\t'
    else if (c === 7) out += '\\a'
    else if (c === 8) out += '\\b'
    else if (c >= 0x20 && c <= 0x7e) out += ch
    else out += '\\x' + c.toString(16).padStart(2, '0')
  }
  return out + '"'
}

function format(reply, indent = 0) {
  switch (reply.t) {
    case 'status': return reply.v
    case 'error': return `(error) ${reply.v}`
    case 'int': return `(integer) ${reply.v}`
    case 'nil': return '(nil)'
    case 'bulk': return repr(reply.v)
    case 'array': {
      if (reply.v.length === 0) return '(empty array)'
      // Indices are padded to the widest one (` 1)` .. `11)`), and every item
      // after the first is indented by the parent's prefix width, which is
      // how redis-cli lays out nested replies such as EXEC results.
      const width = String(reply.v.length).length
      const lines = []
      reply.v.forEach((item, i) => {
        const prefix = `${String(i + 1).padStart(width, ' ')}) `
        const body = format(item, indent + prefix.length).split('\n')
        lines.push(' '.repeat(i === 0 ? 0 : indent) + prefix + body[0])
        for (const rest of body.slice(1)) lines.push(rest)
      })
      return lines.join('\n')
    }
  }
  throw new Error(`cannot format reply type ${reply.t}`)
}

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
      if (first && first.startsWith(PROMPT)) blocks.push({ startLine, body })
      fence = null
    } else if (fence) {
      body.push(line)
    }
  })
  return blocks
}

// A block becomes a list of steps: a command with its expected output, or a wait.
function steps(block) {
  const out = []
  let cur = null
  block.body.forEach((line, k) => {
    const lineNo = block.startLine + k
    if (line.startsWith(PROMPT)) {
      cur = { kind: 'cmd', text: line.slice(PROMPT.length), lineNo, expected: [] }
      out.push(cur)
      return
    }
    const wait = line.match(/^#\s*wait\s+(\d+)\s*ms\b/i)
    if (wait) {
      out.push({ kind: 'wait', ms: parseInt(wait[1], 10) })
      cur = null
      return
    }
    if (line.startsWith('#')) return
    // redis-cli annotates slow blocking commands with their duration, e.g.
    // `(1.07s)`. It is timing, not a reply, so it is never compared.
    if (/^\(\d+(\.\d+)?s\)$/.test(line.trim())) return
    if (cur) cur.expected.push(line)
    else if (line.trim() !== '') {
      throw new Error(`line ${lineNo}: output before any command: ${line}`)
    }
  })
  for (const s of out) {
    if (s.kind !== 'cmd') continue
    while (s.expected.length && s.expected[s.expected.length - 1].trim() === '') s.expected.pop()
  }
  return out
}

// ---------------------------------------------------------------------------
// Server lifecycle.

async function startServer() {
  const dir = mkdtempSync(join(tmpdir(), 'redis-lessons-'))
  const socket = join(dir, 'redis.sock')
  const proc = spawn('redis-server', [
    '--port', '0',
    '--unixsocket', socket,
    '--save', '',
    '--appendonly', 'no',
    '--dir', dir,
  ], { stdio: 'ignore' })
  const spawnError = new Promise((_, rej) => proc.once('error', rej))
  for (let i = 0; i < 100; i++) {
    if (existsSync(socket)) break
    await Promise.race([new Promise((r) => setTimeout(r, 50)), spawnError])
  }
  if (!existsSync(socket)) throw new Error('redis-server did not open its socket')
  return {
    socket,
    // Wait for the server to actually exit before removing its directory, so
    // nothing is deleted out from under a process that is still shutting down.
    async stop() {
      const exited = new Promise((r) => proc.once('exit', r))
      proc.kill()
      await Promise.race([exited, new Promise((r) => setTimeout(r, 5000))])
      rmSync(dir, { recursive: true, force: true })
    },
  }
}

// ---------------------------------------------------------------------------

// CONFIG GET * as a plain object.
async function readConfig(conn) {
  const reply = await conn.send(['CONFIG', 'GET', '*'])
  const out = {}
  for (let i = 0; i < reply.v.length; i += 2) out[reply.v[i].v] = reply.v[i + 1].v
  return out
}

// Undo any CONFIG SET a previous lesson left behind. Only parameters that
// differ from the startup snapshot are touched, and those can only differ
// because a lesson set them at runtime, so they are settable.
async function restoreConfig(conn, baseline) {
  const now = await readConfig(conn)
  for (const [name, value] of Object.entries(baseline)) {
    if (now[name] === value) continue
    const r = await conn.send(['CONFIG', 'SET', name, value])
    if (r.t === 'error') throw new Error(`could not restore ${name}: ${r.v}`)
  }
}

async function verifyFile(file, socket, baseline) {
  const md = readFileSync(file, 'utf8')
  const blocks = transcripts(md)
  const failures = []
  let commands = 0
  const conn = new Conn(socket)
  await conn.ready
  try {
    await restoreConfig(conn, baseline)
    // FLUSHALL empties the keyspace but not the script and function caches,
    // so clear those too: a lesson must not pass on an EVALSHA only because
    // an earlier lesson happened to load that script.
    await conn.send(['FLUSHALL'])
    await conn.send(['SCRIPT', 'FLUSH'])
    await conn.send(['FUNCTION', 'FLUSH'])
    for (const block of blocks) {
      for (const step of steps(block)) {
        if (step.kind === 'wait') {
          await new Promise((r) => setTimeout(r, step.ms))
          continue
        }
        commands++
        let args
        try {
          args = splitArgs(step.text)
        } catch (e) {
          failures.push({ lineNo: step.lineNo, cmd: step.text, problem: e.message })
          continue
        }
        const reply = await conn.send(args)
        const actual = format(reply).split('\n').map((l) => l.trimEnd())
        const expected = step.expected.map((l) => l.trimEnd())
        if (actual.join('\n') !== expected.join('\n')) {
          failures.push({ lineNo: step.lineNo, cmd: step.text, expected, actual })
        }
      }
    }
  } finally {
    conn.close()
  }
  return { blocks: blocks.length, commands, failures }
}

async function main() {
  const files = process.argv.slice(2).length
    ? process.argv.slice(2)
    : readdirSync(courseDir)
        .filter((f) => f.endsWith('.md'))
        .sort((a, b) => (parseInt(a.match(/\d+/)) || 0) - (parseInt(b.match(/\d+/)) || 0))
        .map((f) => join(courseDir, f))

  const server = await startServer()
  let failed = 0
  let total = 0
  try {
    const probe = new Conn(server.socket)
    await probe.ready
    const info = (await probe.send(['INFO', 'server'])).v
    const baseline = await readConfig(probe)
    probe.close()
    const version = info.match(/redis_version:(\S+)/)?.[1] ?? 'unknown'
    console.log(`Replaying transcripts against redis-server ${version}\n`)

    for (const file of files) {
      const name = relative(process.cwd(), file)
      const { blocks, commands, failures } = await verifyFile(file, server.socket, baseline)
      total += commands
      if (!failures.length) {
        console.log(`  ok    ${name}  (${blocks} transcripts, ${commands} commands)`)
        continue
      }
      failed += failures.length
      console.log(`  FAIL  ${name}`)
      for (const f of failures) {
        console.log(`\n    line ${f.lineNo}: ${PROMPT}${f.cmd}`)
        if (f.problem) {
          console.log(`      ${f.problem}`)
          continue
        }
        console.log('      lesson shows:')
        for (const l of f.expected.length ? f.expected : ['<nothing>']) console.log(`        ${l}`)
        console.log('      redis returned:')
        for (const l of f.actual) console.log(`        ${l}`)
      }
      console.log()
    }
  } finally {
    await server.stop()
  }

  console.log(
    failed
      ? `\n${failed} transcript step(s) do not match the server.`
      : `\nAll ${total} commands match the server.`,
  )
  process.exit(failed ? 1 : 0)
}

export { splitArgs, format, transcripts, steps, Conn, startServer, PROMPT }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e)
    process.exit(2)
  })
}
