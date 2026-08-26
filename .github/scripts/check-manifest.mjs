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

  // 4. Every disabled check must explain itself, so `false` never means "unknown".
  const checks = p.checks ?? {};
  const anyDisabled = Object.values(checks).some((v) => v === false);
  if (anyDisabled && !p.notes) {
    fail(`"${label}" disables a check but has no \`notes\` explaining why.`);
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
