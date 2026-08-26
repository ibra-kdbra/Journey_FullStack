#!/usr/bin/env node
/**
 * Cross-validates the Atlas course UI against the content tree on disk.
 *
 * This exists because the courses section shipped broken and nothing noticed:
 * `pages/courses/[...slug].vue` read lessons from a PocketBase collection that
 * no longer existed, so every lesson URL returned HTTP 500, while the index
 * grouped paths on a four-segment shape the content tree never had. Both are
 * the kind of break a build cannot see — the pages compiled fine.
 *
 * Three invariants, each one a failure that actually happened:
 *
 *   1. Every course id in `utils/academy.ts` is a real directory under
 *      `content/courses/`, and every directory has an entry. The old registry
 *      listed `clang`, `dsa`, `kotlin`, `nodejs`, `reactjs` and `turkish`,
 *      none of which were ever on disk.
 *   2. Every course's discipline is one the discipline list declares. The old
 *      registry's ids matched no content path at all, so selecting any
 *      discipline showed an empty page.
 *   3. Every internal `/courses/...` link in a component or page resolves to a
 *      markdown file that exists. The footer linked to
 *      `/courses/systems/rust/lesson_0` and `/courses/systems/clang/lesson_0`,
 *      which were a 404 and a double 404 respectively.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('../../', import.meta.url).pathname
const ATLAS = join(ROOT, 'learning-doc')
const COURSES = join(ATLAS, 'content', 'courses')
const ACADEMY = join(ATLAS, 'utils', 'academy.ts')

const problems = []
const fail = (msg) => problems.push(msg)

/** Every markdown file under content/courses, as the route it serves. */
function lessonRoutes(dir = COURSES, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) lessonRoutes(full, out)
    else if (entry.endsWith('.md')) {
      out.push('/' + relative(join(ATLAS, 'content'), full).replace(/\.md$/, ''))
    }
  }
  return out
}

if (!existsSync(COURSES)) {
  console.error('content/courses does not exist — nothing to check.')
  process.exit(1)
}

const routes = lessonRoutes()
const dirsOnDisk = readdirSync(COURSES).filter((e) => statSync(join(COURSES, e)).isDirectory())

const source = readFileSync(ACADEMY, 'utf8')

/**
 * The two arrays are parsed separately on purpose. A single `id:` regex over
 * the whole file matches course entries as well as discipline entries, which
 * would make check 2 vacuous — it would find every course id in its own
 * "discipline" list and never fail.
 */
function arrayBlock(name) {
  const start = source.indexOf(name)
  if (start === -1) throw new Error(`${name} not found in academy.ts`)
  // Seek the assignment, not the first bracket — `academyCourses: AcademyCourse[] = [`
  // would otherwise match the empty pair in the type annotation and parse nothing.
  const eq = source.indexOf('=', start)
  const open = source.indexOf('[', eq)
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '[') depth++
    else if (source[i] === ']' && --depth === 0) return source.slice(open, i + 1)
  }
  throw new Error(`${name} array is not closed`)
}

const disciplineBlock = arrayBlock('academyDisciplines')
const courseBlock = arrayBlock('academyCourses')

const declaredDisciplines = [...disciplineBlock.matchAll(/\{\s*id:\s*'([^']+)'/g)].map((m) => m[1])
const declaredCourses = [...courseBlock.matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'[^']*',\s*discipline:\s*'([^']+)'/g)]
  .map(([, id, discipline]) => ({ id, discipline }))

if (!declaredDisciplines.length) throw new Error('parsed zero disciplines from academy.ts')
if (!declaredCourses.length) throw new Error('parsed zero courses from academy.ts')

// 1. Registry and filesystem agree, both directions.
for (const { id } of declaredCourses) {
  if (!dirsOnDisk.includes(id)) fail(`academy.ts declares course "${id}", but content/courses/${id}/ does not exist`)
}
for (const dir of dirsOnDisk) {
  if (!declaredCourses.some((c) => c.id === dir)) fail(`content/courses/${dir}/ exists, but academy.ts declares no course for it`)
}

// 2. Every course points at a discipline that exists.
for (const { id, discipline } of declaredCourses) {
  if (!declaredDisciplines.includes(discipline)) {
    fail(`course "${id}" has discipline "${discipline}", which is not in academyDisciplines`)
  }
}

// 3. Internal course links resolve to a real lesson.
const linkFiles = []
const collect = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.nuxt' || entry === '.output' || entry === 'src_legacy') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) collect(full)
    else if (/\.(vue|ts)$/.test(entry)) linkFiles.push(full)
  }
}
for (const sub of ['pages', 'components', 'utils', 'composables']) {
  const dir = join(ATLAS, sub)
  if (existsSync(dir)) collect(dir)
}

const routeSet = new Set(routes)
for (const file of linkFiles) {
  const text = readFileSync(file, 'utf8')
  for (const [, link] of text.matchAll(/(?:to|href)="(\/courses\/[^"?#]*)"/g)) {
    if (link === '/courses' || link === '/courses/') continue
    if (!routeSet.has(link)) {
      fail(`${relative(ROOT, file)} links to ${link}, which has no file under content/courses/`)
    }
  }
}

if (problems.length) {
  console.error('Course registry and content tree disagree:\n')
  for (const p of problems) console.error(`  - ${p}`)
  console.error(`\n${problems.length} problem(s).`)
  process.exit(1)
}

console.log(`Checked ${declaredCourses.length} courses and ${routes.length} lessons across ${declaredDisciplines.length} disciplines.`)
console.log('Course registry, content tree and internal course links all agree.')
