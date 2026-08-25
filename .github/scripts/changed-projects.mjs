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
  install: Boolean(p.checks?.install),
  build: Boolean(p.checks?.build),
  lint: Boolean(p.checks?.lint),
  test: Boolean(p.checks?.test),
  env: p.env ?? {},
});

const eligible = projects.filter((p) => p.ecosystem === 'node' && hasEnabledCheck(p));

// A change to CI plumbing can affect any project, so re-check them all.
const CI_PATHS = ['.github/projects.json', '.github/workflows/', '.github/scripts/'];
const ciChanged = changed.some((f) => CI_PATHS.some((prefix) => f.startsWith(prefix)));

const selected = ciChanged
  ? eligible
  : eligible.filter((p) => changed.some((f) => f === p.path || f.startsWith(`${p.path}/`)));

process.stdout.write(JSON.stringify(selected.map(toMatrixEntry)));
