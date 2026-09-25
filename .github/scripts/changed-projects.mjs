#!/usr/bin/env node
/**
 * Emits the CI matrix: which projects need checking for this diff.
 *
 * Reads a newline-separated list of changed paths on stdin, intersects it with
 * .github/projects.json, and prints a JSON array to stdout.
 *
 * A project only appears if at least one check is enabled for it, so a project
 * that is known-broken never produces a red job.
 *
 * If CI configuration itself changed, every enabled project is returned — a
 * change to the manifest or a workflow can affect all of them.
 *
 *   git diff --name-only origin/main... | node .github/scripts/changed-projects.mjs
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const { projects } = JSON.parse(
  readFileSync(join(ROOT, '.github', 'projects.json'), 'utf8'),
);

const changed = readFileSync(0, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

const hasEnabledCheck = (p) => Object.values(p.checks ?? {}).some(Boolean);

const toMatrixEntry = (p) => ({
  path: p.path,
  // GitHub renders this as the job name; slashes read badly there.
  name: p.path.replace(/\//g, '-'),
  ecosystem: p.ecosystem,
  packageManager: p.packageManager ?? 'npm',
  node: p.node ?? '22',
  python: p.python ?? '3.12',
  // What the job summary shows for this project's toolchain.
  java: p.java ?? '17',
  runtime:
    p.ecosystem === 'python' ? `py${p.python ?? '3.12'}` :
    p.ecosystem === 'maven' ? `jdk${p.java ?? '17'}` :
    `node${p.node ?? '22'}`,
  install: Boolean(p.checks?.install),
  build: Boolean(p.checks?.build),
  lint: Boolean(p.checks?.lint),
  // Unlike the others this is the *name* of the script to run, because the three
  // projects that have one call it `check`, `typecheck` and `type-check`. '' is off.
  typecheck: typeof p.checks?.typecheck === 'string' ? p.checks.typecheck : '',
  test: Boolean(p.checks?.test),
  env: p.env ?? {},
  systemPackages: p.systemPackages ?? [],
  // ADR 0005 / issue #1289. Empty for every project that resolves cleanly; a
  // non-empty value is a recorded peer conflict, not a default.
  installFlags: p.installFlags ?? [],
  // Name of a database to create before the checks run, or '' for none.
  postgres: p.postgres ?? '',
});

// Any ecosystem the workflow knows how to run. This filter previously admitted
// only `node`, which is why Python and Maven projects produced a passing run with
// an empty matrix — a green tick that had verified nothing.
const RUNNABLE = new Set(['node', 'python', 'maven']);
const eligible = projects.filter((p) => RUNNABLE.has(p.ecosystem) && hasEnabledCheck(p));

// A change to CI plumbing can affect any project, so re-check them all.
const CI_PATHS = ['.github/projects.json', '.github/workflows/', '.github/scripts/'];
const ciChanged = changed.some((f) => CI_PATHS.some((prefix) => f.startsWith(prefix)));

const selected = ciChanged
  ? eligible
  : eligible.filter((p) => changed.some((f) => f === p.path || f.startsWith(`${p.path}/`)));

process.stdout.write(JSON.stringify(selected.map(toMatrixEntry)));
