#!/usr/bin/env node
/**
 * Runs every program and command in the Go course and fails if anything
 * prints other than what the lesson shows. The Go counterpart of the Redis,
 * psql and Docker verifiers.
 *
 * Transcripts (`$ ` blocks), file blocks (```go [hello/main.go]), the `[...]`
 * allowance and the one-bash-per-lesson execution are shared with the Docker
 * course and described in lib/shell-transcripts.mjs. Each lesson starts in an
 * empty temporary directory and creates its own modules, exactly as a reader
 * following along would.
 *
 * Go-specific rules:
 *
 * - The course is verified against one Go release: compiler messages, vet
 *   checks and some semantics change between releases, so another toolchain
 *   is refused rather than silently compared. GO_VERSION below names it.
 * - GOTOOLCHAIN=local stops `go` from downloading a different toolchain, and
 *   GOPROXY=off stops it downloading modules: every program in the course uses
 *   only the standard library, and a lesson that tried to fetch anything
 *   would fail here rather than depend on the network.
 * - Anything scheduled concurrently must be made deterministic by the program
 *   - collected and sorted, or synchronised - before it is printed. `[...]`
 *   covers only what is random by design: the time `go test` reports, a
 *   benchmark's measurements, and the one deliberately racy result in
 *   lesson 6. Panic and race reports carry temporary paths, goroutine IDs and
 *   addresses; transcripts filter them with grep to the lines that are fixed.
 * - A demonstration that only fails some of the time - a bug whose effect
 *   depends on map order - runs enough times (`go test -count=N`) that it
 *   fails reliably, rather than being shown from one lucky run.
 *
 * Usage: node scripts/verify-go-transcripts.mjs [lesson.md ...]
 * Needs Go 1.24 as `go` on PATH, and gcc for the race detector.
 * Exits 0 when every transcript matches.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { runCourse, runLesson, steps, commands, lineMatches, trimLines } from './lib/shell-transcripts.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const courseDir = join(here, '..', 'content', 'courses', 'golang')

// The release the transcripts were produced with. Patch releases of one minor
// version are accepted; anything else is refused.
const GO_VERSION = 'go1.24'

const ENV = {
  ...process.env,
  GOTOOLCHAIN: 'local',
  GOPROXY: 'off',
  // A private cache per run, so that no earlier build - or a reader's own
  // settings - can change what `go build` or `go test` prints.
  GOCACHE: mkdtempSync(join(tmpdir(), 'go-lessons-cache-')),
  GOENV: 'off',
  CGO_ENABLED: '1',
  NO_COLOR: '1',
  TERM: 'dumb',
  LC_ALL: 'C.UTF-8',
  TZ: 'UTC',
}

const options = { env: ENV, tmpPrefix: 'go-lesson-' }
process.on('exit', () => rmSync(ENV.GOCACHE, { recursive: true, force: true }))

async function main() {
  let version
  try {
    version = execFileSync('go', ['env', 'GOVERSION'], { encoding: 'utf8', env: ENV }).trim()
  } catch {
    console.error('cannot run `go`: install Go and put it on PATH')
    process.exit(2)
  }
  if (version !== GO_VERSION && !version.startsWith(`${GO_VERSION}.`)) {
    console.error(`the Go course is verified against ${GO_VERSION}.x, but PATH has ${version}`)
    process.exit(2)
  }
  console.log(`Running the Go course with ${version}\n`)
  await runCourse({ courseDir, files: process.argv.slice(2), printedBy: 'go', ...options })
}

// The author's fill tool imports these to regenerate transcripts.
const runGoLesson = (file) => runLesson(file, options)
export { steps, commands, runGoLesson as runLesson, lineMatches, trimLines }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e.message ?? e)
    process.exit(2)
  })
}
