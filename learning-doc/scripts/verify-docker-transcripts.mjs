#!/usr/bin/env node
/**
 * Replays every shell transcript in the Docker course against a real Docker
 * daemon and fails if a command prints anything other than what the lesson
 * shows. The Docker counterpart of verify-redis-transcripts.mjs and
 * verify-psql-transcripts.mjs.
 *
 * Transcripts (`$ ` blocks), file blocks (```dockerfile [path]), the `[...]`
 * allowance and the one-bash-per-lesson execution are shared with the Go
 * course and described in lib/shell-transcripts.mjs.
 *
 * Docker-specific rules:
 *
 * - `[...]` is for values Docker generates at random - container, network and
 *   image IDs - and nothing else. Anything else that is not reproducible
 *   (timestamps, pull progress, `docker ps` columns such as "Up 2 seconds")
 *   belongs out of the transcript: use `--format`, `-q`, or `docker pull -q`
 *   before a `docker run`.
 * - A container's stdout and stderr reach the terminal through separate
 *   streams, and Docker does not preserve their relative order, so a
 *   transcript must not depend on how lines from the two interleave.
 * - Containers, volumes and networks that did not exist before a lesson
 *   started are removed when it ends. Images are not removed (see restore()):
 *   lessons give theirs distinct names, and an image is pulled once, in the
 *   lesson that introduces it, as it would be for a reader following along -
 *   so lessons run in order. Anything that existed before is never touched,
 *   but a lesson that names a container `web` will fail if you already run one
 *   called `web`. Remove the lessons' images afterwards with
 *   `docker image prune` and `docker rmi`.
 *
 * Usage: node scripts/verify-docker-transcripts.mjs [lesson.md ...]
 * Needs a running Docker daemon with network access to Docker Hub, and the
 * compose plugin. Exits 0 when every transcript matches.
 */

import { execFileSync, spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { runCourse, runLesson, steps, commands, lineMatches, trimLines } from './lib/shell-transcripts.mjs'

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

// A command that never finishes - typically a readiness loop whose container
// has died, or cannot be reached - says nothing about why. Show the state and
// last lines of output of every container this lesson created.
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

const options = {
  env: ENV,
  tmpPrefix: 'docker-lesson-',
  hooks: { before: snapshot, after: restore, diagnose },
}

async function main() {
  let version
  try {
    version = docker('version', '--format', '{{.Server.Version}}')[0]
  } catch {
    console.error('cannot reach a Docker daemon: start one, or check DOCKER_HOST')
    process.exit(2)
  }
  console.log(`Replaying transcripts against Docker Engine ${version}\n`)
  await runCourse({ courseDir, files: process.argv.slice(2), printedBy: 'docker', ...options })
}

// The author's fill tool imports these to regenerate transcripts.
const runDockerLesson = (file) => runLesson(file, options)
export { steps, commands, runDockerLesson as runLesson, lineMatches, trimLines }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e.message ?? e)
    process.exit(2)
  })
}
