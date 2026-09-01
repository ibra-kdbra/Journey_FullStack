#!/usr/bin/env node
/**
 * Structural truth check for the monorepo.
 *
 * Validates that the four places which describe "what projects exist" all agree:
 *   .github/projects.json  ·  the filesystem  ·  README.md  ·  .github/dependabot.yml
 *
 * Also re-checks the specific failure that kept this repository red for months:
 * a workflow file that parses but defines no `on:` triggers. GitHub treats that
 * as an invalid workflow and fails the run instantly, with zero jobs.
 *
 * Run locally:  node .github/scripts/check-manifest.mjs
 * Exit code 0 = clean, 1 = findings.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOLDS } from './check-holds.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const errors = [];
const warnings = [];

const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);
const rel = (...p) => join(ROOT, ...p);

/* ------------------------------------------------------------------ manifest */

const manifestPath = rel('.github', 'projects.json');
if (!existsSync(manifestPath)) {
  console.error('FATAL: .github/projects.json is missing.');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (err) {
  console.error(`FATAL: .github/projects.json is not valid JSON — ${err.message}`);
  process.exit(1);
}

const projects = manifest.projects ?? [];
if (projects.length === 0) fail('projects.json declares no projects.');

const MANIFEST_FILES = [
  'package.json',
  'pyproject.toml',
  'pom.xml',
  'Cargo.toml',
  'go.mod',
  'requirements.txt',
];

const seen = new Set();

for (const p of projects) {
  const label = p.path ?? '<missing path>';

  if (!p.path) { fail('A manifest entry has no `path`.'); continue; }
  if (seen.has(p.path)) fail(`Duplicate manifest entry for "${p.path}".`);
  seen.add(p.path);

  // 1. The directory must exist. A stale entry is how CI starts lying.
  const dir = rel(p.path);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    fail(`projects.json points at "${p.path}", which does not exist on disk.`);
    continue;
  }

  // 2. It must carry a recognised manifest for its ecosystem.
  const hasManifest = MANIFEST_FILES.some((f) => existsSync(join(dir, f))) ||
    // Java services here have no aggregator POM; accept a POM one level down.
    (p.ecosystem === 'java' &&
      readdirSync(dir, { withFileTypes: true })
        .some((e) => e.isDirectory() && existsSync(join(dir, e.name, 'pom.xml')))) ||
    (p.ecosystem === 'python' &&
      readdirSync(dir, { withFileTypes: true })
        .some((e) => e.isDirectory() && existsSync(join(dir, e.name, 'pyproject.toml'))));

  if (!hasManifest) fail(`"${p.path}" has no recognised package manifest.`);

  // 3. Required fields.
  for (const field of ['ecosystem', 'checks']) {
    if (!(field in p)) fail(`"${label}" is missing required field \`${field}\`.`);
  }

  // 4. Every disabled check must explain itself *by name*, so `false` never
  //    means "unknown".
  //
  //    This used to accept any `notes` at all when any check was off, which is
  //    how angular-s.o.l.i.d-advanced sat at `test: false` while carrying a
  //    note about its typescript hold. Five spec files and a full Karma setup
  //    were sitting there unread, and the manifest looked complete (#1407).
  const checks = p.checks ?? {};
  const notes = (p.notes ?? '').toLowerCase();
  for (const name of ['install', 'build', 'lint', 'test']) {
    if (checks[name] !== false) continue;
    if (!new RegExp(`\\b${name}\\b`).test(notes)) {
      fail(
        `"${label}" sets \`${name}: false\` but its \`notes\` never mention ${name}. ` +
          `Say why - no script, a placeholder, a failing case, an upstream wait - ` +
          `so the next reader can tell "nothing to run" from "nobody looked".`,
      );
    }
  }

  // 5. A node project with `build: true` must actually have a build script.
  if (p.ecosystem === 'node' && checks.build === true) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      const scripts = JSON.parse(readFileSync(pkgPath, 'utf8')).scripts ?? {};
      if (!scripts.build) {
        fail(`"${label}" sets \`build: true\` but package.json defines no build script.`);
      }
    }
  }

  // 6. `checks.typecheck` names a script rather than flipping a boolean, so the
  // name has to exist. A manifest pointing at a script nobody wrote is a step
  // that fails on the first run for a reason unrelated to the code.
  if (typeof checks.typecheck === 'string') {
    if (p.ecosystem !== 'node') {
      fail(`"${label}" sets \`typecheck\` but is not a node project; only node projects run npm scripts.`);
    } else {
      const pkgPath = join(dir, 'package.json');
      if (existsSync(pkgPath)) {
        const scripts = JSON.parse(readFileSync(pkgPath, 'utf8')).scripts ?? {};
        if (!scripts[checks.typecheck]) {
          fail(`"${label}" sets \`typecheck: "${checks.typecheck}"\` but package.json defines no such script.`);
        }
      }
    }
  }

  // 7. ADR 0005: every node project commits a lockfile for its declared package
  // manager, and only for that one. Both halves matter — a project carrying a
  // lockfile nothing reads is how three of them silently went corrupt or stale.
  if (p.ecosystem === 'node') {
    const manager = p.packageManager ?? 'npm';
    const expected = { npm: 'package-lock.json', pnpm: 'pnpm-lock.yaml', yarn: 'yarn.lock', bun: 'bun.lock' }[manager];

    if (!expected) {
      fail(`"${label}" declares an unrecognised packageManager "${manager}".`);
    } else if (!existsSync(join(dir, expected))) {
      fail(`"${label}" declares ${manager} but has no ${expected}. See ADR 0005 — installs must be reproducible.`);
    }

    for (const [otherManager, file] of Object.entries({ npm: 'package-lock.json', pnpm: 'pnpm-lock.yaml', yarn: 'yarn.lock', bun: 'bun.lock' })) {
      if (file !== expected && existsSync(join(dir, file))) {
        fail(`"${label}" declares ${manager} but also carries ${file}. A lockfile no install reads is a lockfile nothing checks — delete it or change packageManager to ${otherManager}.`);
      }
    }
  }
}

/* ------------------------------------------------- filesystem → manifest gaps */

const IGNORED_DIRS = new Set(['.git', '.github', '.vscode', 'docs', 'node_modules']);

for (const entry of readdirSync(ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory() || IGNORED_DIRS.has(entry.name)) continue;
  const dir = join(ROOT, entry.name);
  const isProject = MANIFEST_FILES.some((f) => existsSync(join(dir, f))) ||
    readdirSync(dir, { withFileTypes: true })
      .some((e) => e.isDirectory() &&
        (existsSync(join(dir, e.name, 'pom.xml')) || existsSync(join(dir, e.name, 'pyproject.toml'))));

  if (isProject && !seen.has(entry.name)) {
    fail(`"${entry.name}" looks like a project but has no entry in projects.json.`);
  }
}

/* ------------------------------------------------------------------- README */

const readmePath = rel('README.md');
if (existsSync(readmePath)) {
  const readme = readFileSync(readmePath, 'utf8');
  for (const p of projects) {
    if (!readme.includes(p.path)) {
      warn(`"${p.path}" is in projects.json but never mentioned in README.md.`);
    }
  }
} else {
  fail('README.md is missing.');
}

/* --------------------------------------------------------------- Atlas pages */

const atlasDir = rel('learning-doc', 'content', 'atlas');
if (existsSync(atlasDir)) {
  const pages = readdirSync(atlasDir).filter((f) => f.endsWith('.md'));
  const documented = new Set();
  for (const file of pages) {
    const body = readFileSync(join(atlasDir, file), 'utf8');
    const match = body.match(/^project:\s*(.+)$/m);
    if (match) documented.add(match[1].trim().replace(/^["']|["']$/g, ''));
  }
  for (const p of projects) {
    // A nested project (e.g. solid-flask-web-app/ui) is considered documented
    // when its parent has an Atlas entry covering it.
    const coveredByParent = p.path.includes('/') && documented.has(p.path.split('/')[0]);
    if (!documented.has(p.path) && !coveredByParent) {
      warn(`"${p.path}" has no Atlas entry in learning-doc/content/atlas/.`);
    }
  }
  for (const d of documented) {
    if (!seen.has(d)) {
      fail(`Atlas documents "${d}", which is not in projects.json.`);
    }
  }
}

/* ---------------------------------------------------------------- dependabot */

const dependabotPath = rel('.github', 'dependabot.yml');
if (existsSync(dependabotPath)) {
  const raw = readFileSync(dependabotPath, 'utf8');
  // Deliberately a line scan rather than a YAML dependency: this script must run
  // with zero installs so the hygiene job stays fast.
  const targets = [];
  let ecosystem = null;
  for (const line of raw.split('\n')) {
    const eco = line.match(/^\s*-?\s*package-ecosystem:\s*["']?([\w-]+)/);
    if (eco) ecosystem = eco[1];
    const dir = line.match(/^\s*-?\s*(?:directory|-)\s*:?\s*["']([^"']+)["']\s*$/);
    if (dir && ecosystem) targets.push({ ecosystem, directory: dir[1] });
  }

  const ECOSYSTEM_MANIFEST = {
    npm: ['package.json'],
    bun: ['bun.lock'],
    pip: ['pyproject.toml', 'requirements.txt'],
    maven: ['pom.xml'],
    docker: ['Dockerfile'],
    'github-actions': ['.github'],
  };

  /* Every `ignore` rule is a hold, and a hold nobody re-checks becomes "how this
   * repo is". check-holds.mjs is the thing that re-checks them, so an ignore rule
   * with no entry there is a hold with no clearing condition and no watcher - the
   * weekly job reports "all holds still justified" without ever looking at it.
   * Six of the seven held dependencies were in exactly that state. */
  const ignored = [];
  {
    let inIgnore = false;
    let ignoreIndent = 0;
    for (const line of raw.split('\n')) {
      if (/^\s*#/.test(line) || !line.trim()) continue;
      const indent = line.match(/^\s*/)[0].length;
      if (/^\s*ignore:\s*$/.test(line)) {
        inIgnore = true;
        ignoreIndent = indent;
        continue;
      }
      if (inIgnore && indent <= ignoreIndent && /^\s*[\w-]+:/.test(line)) inIgnore = false;
      if (!inIgnore) continue;
      const dep = line.match(/^\s*-\s*dependency-name:\s*["']([^"']+)["']/);
      if (dep) ignored.push(dep[1]);
    }
  }

  const covered = new Set(HOLDS.flatMap((h) => h.covers ?? []));
  for (const dep of new Set(ignored)) {
    if (covered.has(dep)) continue;
    fail(
      `dependabot.yml ignores "${dep}", but no entry in check-holds.mjs covers it. ` +
        `An ignore rule with no hold entry is a hold with no clearing condition and ` +
        `nothing asking whether it can be lifted - the weekly holds job will report ` +
        `"all holds still justified" without ever checking this one. Add a HOLDS entry ` +
        `with a \`covers: ['${dep}']\` field and a real check(), plus a row in ` +
        `docs/ENGINEERING.md#known-open-work.`,
    );
  }

  for (const t of targets) {
    if (t.directory === '/') continue;
    const dir = rel(t.directory.replace(/^\//, ''));
    if (!existsSync(dir)) {
      fail(`dependabot.yml targets "${t.directory}" (${t.ecosystem}), which does not exist.`);
      continue;
    }
    const expected = ECOSYSTEM_MANIFEST[t.ecosystem];
    if (expected && !expected.some((f) => existsSync(join(dir, f)))) {
      fail(`dependabot.yml targets "${t.directory}" for ${t.ecosystem}, but it has no ${expected.join(' or ')}.`);
    }
  }
}

/* ----------------------------------------------------------------- workflows */

const workflowDir = rel('.github', 'workflows');
if (existsSync(workflowDir)) {
  for (const file of readdirSync(workflowDir)) {
    if (!/\.ya?ml$/.test(file)) continue;
    const body = readFileSync(join(workflowDir, file), 'utf8');
    const meaningful = body
      .split('\n')
      .filter((l) => l.trim() && !l.trim().startsWith('#'));

    if (meaningful.length === 0) {
      fail(`.github/workflows/${file} is entirely comments. GitHub treats that as an invalid workflow and fails every run. Delete the file instead.`);
      continue;
    }
    const hasTrigger = meaningful.some((l) => /^(on|"on"|'on'|true)\s*:/.test(l.trim()));
    if (!hasTrigger) {
      fail(`.github/workflows/${file} defines no \`on:\` triggers. GitHub fails such runs instantly with zero jobs.`);
    }
    const hasJobs = meaningful.some((l) => /^jobs\s*:/.test(l.trim()));
    if (!hasJobs) {
      fail(`.github/workflows/${file} defines no \`jobs:\` block.`);
    }
  }
}

/* -------------------------------------------------------------------- report */

const enabled = projects.filter((p) => p.checks?.install).length;
console.log(`Checked ${projects.length} projects (${enabled} with CI checks enabled).\n`);

if (warnings.length) {
  console.log(`WARNINGS (${warnings.length}):`);
  for (const w of warnings) console.log(`  ! ${w}`);
  console.log('');
}

if (errors.length) {
  console.error(`FAILURES (${errors.length}):`);
  for (const e of errors) console.error(`  x ${e}`);
  console.error('\nSee docs/ENGINEERING.md for what each of these means.');
  process.exit(1);
}

console.log('Manifest, filesystem, README, Atlas, dependabot and workflows all agree.');
