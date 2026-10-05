#!/usr/bin/env node
/**
 * The course lessons are not in this repository. They live in a private
 * GitLab repository, together with the tooling that verifies their
 * transcripts, and this script copies its courses/ directory to
 * content/courses/ - before the site is built or served (npm runs it as
 * prebuild, pregenerate and predev) and before CI's check-courses.mjs.
 *
 *   COURSES_TOKEN  a GitLab token with read_repository on that repository
 *   COURSES_REPO   the repository to fetch from (default below)
 *   COURSES_REF    the branch or tag to fetch (default main)
 *
 * Without a token, a content/courses/ fetched earlier is used as it is. With
 * neither, the script fails: a site built without its courses is not this
 * site, and a green build of it would say nothing. COURSES_SKIP=1 builds
 * without them on purpose, for work on the site's code alone.
 */

import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'courses')
const repo = process.env.COURSES_REPO || 'https://gitlab.com/ibra_kdbra/journey-course-verifiers.git'
const ref = process.env.COURSES_REF || 'main'
const token = process.env.COURSES_TOKEN

const count = (dir) => {
  const courses = readdirSync(dir).filter((e) => statSync(join(dir, e)).isDirectory())
  const lessons = readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.md'))
  return `${lessons.length} lessons in ${courses.length} courses`
}

if (!token) {
  if (existsSync(target)) {
    console.log(`fetch-courses: no COURSES_TOKEN, using the existing content/courses (${count(target)})`)
    process.exit(0)
  }
  if (process.env.COURSES_SKIP === '1') {
    mkdirSync(target, { recursive: true })
    console.warn('fetch-courses: COURSES_SKIP=1 - building without any courses')
    process.exit(0)
  }
  console.error(
    'fetch-courses: content/courses is missing and COURSES_TOKEN is not set.\n' +
      `The lessons live in ${repo}. Set COURSES_TOKEN to a GitLab token with\n` +
      'read_repository on it, or COURSES_SKIP=1 to build the site without courses.',
  )
  process.exit(1)
}

const checkout = mkdtempSync(join(tmpdir(), 'courses-'))
try {
  // The token reaches git through a credential helper that reads it from the
  // environment, so it is never part of a URL, an argument or a config file.
  const git = (...args) =>
    execFileSync(
      'git',
      ['-c', 'credential.helper=', '-c', 'credential.helper=!f() { echo username=oauth2; echo "password=$COURSES_TOKEN"; }; f', ...args],
      { encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, stdio: ['ignore', 'pipe', 'inherit'] },
    ).trim()
  git('clone', '--quiet', '--depth', '1', '--branch', ref, repo, checkout)
  const commit = git('-C', checkout, 'rev-parse', '--short', 'HEAD')
  const source = join(checkout, 'courses')
  if (!existsSync(source)) throw new Error(`${repo}@${ref} has no courses/ directory`)
  rmSync(target, { recursive: true, force: true })
  cpSync(source, target, { recursive: true })
  console.log(`fetch-courses: ${count(target)} from ${repo}@${ref} (${commit})`)
} catch (e) {
  console.error(`fetch-courses: ${e.message}`)
  process.exitCode = 1
} finally {
  rmSync(checkout, { recursive: true, force: true })
}
