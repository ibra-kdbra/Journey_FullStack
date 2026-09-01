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
import { pathToFileURL } from 'node:url'

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

/** Numeric version compare. String compare puts 0.2.0 above 0.16.2; this does not. */
const cmp = (a, b) => {
  const pa = String(a).split('.').map(Number)
  const pb = String(b).split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d) return d
  }
  return 0
}

/** Does a semver range string mention the given major at all? */
const rangeAdmitsMajor = (range, m) => new RegExp(`(^|[^\\d.])${m}\\.`).test(String(range ?? ''))

const HOLDS = [
  {
    name: 'typescript held at ^6',
    covers: ['typescript'],
    projects: ['nestjs-s.o.l.i.d', 'vue3-clean-architecture', 'angular-s.o.l.i.d-advanced', 'API_s.o.l.i.d_TS'],
    why:
      'TS 7.0 removed the programmatic compiler API that the Nest CLI, vue-tsc and ts-node all need. ' +
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

  {
    name: 'mjml held at ^4 (sveltekit)',
    covers: ['mjml'],
    projects: ['sveltekit'],
    why:
      'sailkit is the only consumer of mjml here - the project imports it nowhere itself - ' +
      'and sailkit peers mjml ^4.0.0. This is purely sailkit\'s range to widen.',
    clearsWhen: 'sailkit widens its mjml peer range to admit 5.x.',
    async check() {
      const peers = await npmView('sailkit@latest', 'peerDependencies')
      const range = peers?.mjml ?? null
      const latestMjml = await npmView('mjml@latest', 'version')
      const notes = [
        `mjml@latest = ${latestMjml ?? 'unknown'}`,
        `sailkit@latest peer mjml = ${range ?? 'unknown'}`,
      ]
      if (!range) {
        notes.push('could not read sailkit\'s peer range - treating the hold as still justified')
        return { clearable: false, notes }
      }
      const widened = rangeAdmitsMajor(range, 5)
      notes.push(`sailkit admits mjml 5.x: ${widened ? 'yes' : 'no'}`)
      return { clearable: widened, notes }
    },
  },

  {
    name: 'jasmine held at 5.x (angular)',
    covers: ['jasmine-core', '@types/jasmine'],
    projects: ['angular-s.o.l.i.d-advanced'],
    why:
      'jasmine 6 made its env methods non-writable. zone.js patches them by assignment, ' +
      'so the suite dies at load before a single spec runs (issue #1407).',
    clearsWhen: 'zone.js releases past 0.16.2 - the version that still patches by assignment.',
    async check() {
      const latestZone = await npmView('zone.js@latest', 'version')
      const latestJasmine = await npmView('jasmine-core@latest', 'version')
      const notes = [
        `zone.js@latest = ${latestZone ?? 'unknown'}`,
        `jasmine-core@latest = ${latestJasmine ?? 'unknown'} (held at 5.13.0)`,
      ]
      if (!latestZone) {
        notes.push('could not read zone.js - treating the hold as still justified')
        return { clearable: false, notes }
      }
      // Compare numerically: '0.2.0' > '0.16.2' as strings, which is how this
      // check would silently never fire.
      const moved = cmp(latestZone, '0.16.2') > 0
      notes.push(`zone.js moved past 0.16.2: ${moved ? 'yes' : 'no'}`)
      return { clearable: moved, notes }
    },
  },

  {
    name: '@babel/* majors held at 7 (rn_clean_architecture)',
    covers: ['@babel/*'],
    projects: ['rn_clean_architecture'],
    why:
      '@react-native/babel-preset peers @babel/core as "*" - permissive enough that the ' +
      'resolver sees no conflict - while depending on ^7.25.2 internally. Bumping the ' +
      'project to @babel/core 8 gets two Babels rather than an upgrade (issue #1296).',
    clearsWhen: '@react-native/babel-preset depends on @babel/core 8.x.',
    async check() {
      const deps = await npmView('@react-native/babel-preset@latest', 'dependencies')
      const range = deps?.['@babel/core'] ?? null
      const latestBabel = await npmView('@babel/core@latest', 'version')
      const notes = [
        `@babel/core@latest = ${latestBabel ?? 'unknown'}`,
        `@react-native/babel-preset@latest dep @babel/core = ${range ?? 'unknown'}`,
      ]
      if (!range) {
        notes.push('could not read the preset\'s dependency - treating the hold as still justified')
        return { clearable: false, notes }
      }
      const moved = rangeAdmitsMajor(range, 8)
      notes.push(`preset depends on @babel/core 8.x: ${moved ? 'yes' : 'no'}`)
      return { clearable: moved, notes }
    },
  },

  {
    name: 'jest held at 29 (rn_clean_architecture)',
    covers: ['jest', 'jest-environment-node'],
    projects: ['rn_clean_architecture'],
    why:
      '@react-native/jest-preset 0.87 is a jest 29 preset: it depends on babel-jest ^29.7.0, ' +
      'jest-environment-node ^29.7.0 and @jest/create-cache-key-function ^29.7.0. Moving the ' +
      'project to jest 30 while the preset pins 29 splits the test stack (issue #1296).',
    clearsWhen: '@react-native/jest-preset depends on the 30.x jest packages.',
    async check() {
      const deps = await npmView('@react-native/jest-preset@latest', 'dependencies')
      const range = deps?.['jest-environment-node'] ?? null
      const latestJest = await npmView('jest@latest', 'version')
      const notes = [
        `jest@latest = ${latestJest ?? 'unknown'}`,
        `@react-native/jest-preset@latest dep jest-environment-node = ${range ?? 'unknown'}`,
      ]
      if (!range) {
        notes.push('could not read the preset\'s dependency - treating the hold as still justified')
        return { clearable: false, notes }
      }
      const moved = rangeAdmitsMajor(range, 30)
      notes.push(`preset depends on jest 30.x: ${moved ? 'yes' : 'no'}`)
      return { clearable: moved, notes }
    },
  },
]

/**
 * Exported so check-manifest.mjs can assert that every semver-major `ignore`
 * rule in dependabot.yml is covered by an entry here. Importing must not fire
 * the network checks, hence the run-as-main guard at the bottom.
 */
export { HOLDS }

async function main() {
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

  console.log(`All ${HOLDS.length} holds still justified.`)
}

// Run only when invoked directly, so importing HOLDS costs no network calls.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
