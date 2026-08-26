#!/usr/bin/env node
/**
 * Asks whether a deliberately held dependency can be un-held yet.
 *
 * A hold with a written clearing condition and nothing checking it has one
 * default outcome: it stays held forever and quietly becomes "how this repo
 * is". `dependabot.yml` ignore rules stop the weekly red PR, which is correct,
 * but they also stop the only signal that anyone was still watching.
 *
 * This script is that signal. It exits 0 while a hold is still justified and
 * exits 1 when one looks clearable — a failure here means "go do the upgrade",
 * not "something broke". Run weekly from hygiene.yml.
 *
 * Holds live in HOLDS below. Removing a hold means deleting its entry here,
 * its `ignore` rule in dependabot.yml, and its row in
 * docs/ENGINEERING.md#known-open-work — all three, or the next person
 * rediscovers the constraint from a CI log.
 */

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)

/** `npm view <spec> <field> --json`, or null when npm has nothing to say. */
async function npmView(spec, field) {
  try {
    const { stdout } = await run('npm', ['view', spec, field, '--json'], { timeout: 60_000 })
    return stdout.trim() ? JSON.parse(stdout) : null
  } catch (err) {
    console.error(`  ! npm view ${spec} ${field} failed: ${err.shortMessage ?? err.message}`)
    return null
  }
}

const major = (v) => parseInt(String(v).split('.')[0], 10)
const minor = (v) => parseInt(String(v).split('.')[1] ?? '0', 10)

const HOLDS = [
  {
    name: 'typescript held at ^6',
    projects: ['nestjs-s.o.l.i.d', 'vue3-clean-architecture', 'angular-s.o.l.i.d-advanced'],
    why:
      'TS 7.0 removed the programmatic compiler API that the Nest CLI and vue-tsc both need. ' +
      'Angular is a second, independent constraint: @angular/compiler-cli@22 declares a ' +
      'typescript >=6.0 <6.1 peer range.',
    clearsWhen: 'TS 7.1+ restores the compiler API AND @angular/compiler-cli widens its peer range.',
    async check() {
      const latestTs = await npmView('typescript@latest', 'version')
      const ngPeers = await npmView('@angular/compiler-cli@latest', 'peerDependencies')
      const ngRange = ngPeers?.typescript ?? null

      const notes = [`typescript@latest = ${latestTs ?? 'unknown'}`]
      notes.push(`@angular/compiler-cli@latest peer typescript = ${ngRange ?? 'unknown'}`)

      if (!latestTs || !ngRange) {
        notes.push('could not resolve both facts — treating the hold as still justified')
        return { clearable: false, notes }
      }

      // The API restoration is a 7.1+ question; 7.0 is the release that removed it.
      const tsRestored = major(latestTs) > 7 || (major(latestTs) === 7 && minor(latestTs) >= 1)
      // Angular has widened if its declared range mentions a 7.x ceiling or floor at all.
      const angularWidened = /(^|[^\d])7\./.test(ngRange)

      notes.push(`compiler API plausibly restored: ${tsRestored ? 'yes' : 'no'}`)
      notes.push(`Angular peer range admits 7.x: ${angularWidened ? 'yes' : 'no'}`)

      return { clearable: tsRestored && angularWidened, notes }
    },
  },
]

console.log(`Checking ${HOLDS.length} dependency hold(s).\n`)

let clearable = 0
for (const hold of HOLDS) {
  console.log(`── ${hold.name}`)
  console.log(`   projects: ${hold.projects.join(', ')}`)
  console.log(`   clears when: ${hold.clearsWhen}`)
  const result = await hold.check()
  for (const note of result.notes) console.log(`   · ${note}`)
  if (result.clearable) {
    clearable++
    console.log(`   >> CLEARABLE — this hold looks liftable. Verify by building the projects, then remove:`)
    console.log(`      - the ignore rule in .github/dependabot.yml`)
    console.log(`      - the entry in this script`)
    console.log(`      - the row in docs/ENGINEERING.md#known-open-work`)
  } else {
    console.log(`   -> still justified`)
  }
  console.log()
}

if (clearable) {
  console.error(`${clearable} hold(s) look clearable. That is the point of this job — not a breakage.`)
  process.exit(1)
}

console.log('All holds still justified.')
