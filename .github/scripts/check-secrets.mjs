#!/usr/bin/env node
/**
 * Scan the tracked tree for credential-shaped strings.
 *
 * ci.yml already notices when projects.json looks credential-bearing, but only
 * because GitHub silently drops a matrix output it distrusts. Nothing looked at
 * the rest of the tree - which is how API_s.o.l.i.d_TS/ormconfig.json carried a
 * live Postgres URL, username and password in plaintext through every CI run
 * this repository has ever made (issue #1406).
 *
 * The bar is deliberately narrow. A scanner that cries wolf gets switched off,
 * so this looks for shapes that are credentials and almost nothing else, and
 * exempts the values a repository legitimately commits: localhost, placeholders
 * and .env.example.
 *
 * Besides content shapes it fails any tracked env file (.env, .env.local,
 * prod.env ...) that is not a template, and any NAME=value line in an env-style
 * file whose name says token/secret/password/api key and whose value is not a
 * placeholder. The rules live in check-secrets-rules.mjs and are exercised by
 * check-secrets.test.mjs.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import {
  ENV_FILE_ALLOWLIST,
  RULES,
  envAssignments,
  isEnvStyle,
  isEnvTemplate,
  isForbiddenEnvFile,
} from './check-secrets-rules.mjs';

const failures = [];
const fail = (file, line, what, text) =>
  failures.push({ file, line, what, text });

// Lockfiles are hashes, and docs quote incidents on purpose. Both would otherwise
// be permanent false positives. Env templates are NOT skipped: they are scanned
// for real values like any other env-style file.
const SKIP_PATH = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lock|poetry\.lock)$|^docs\//;

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((f) => !SKIP_PATH.test(f));

for (const file of files) {
  if (isForbiddenEnvFile(file)) {
    fail(
      file,
      1,
      'tracked env file',
      'Env files hold real values; commit a .env.example with placeholders instead.',
    );
    continue;
  }

  let stat;
  try {
    stat = statSync(file);
  } catch {
    continue; // deleted but still indexed
  }
  if (!stat.isFile() || stat.size > 2_000_000) continue;

  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (text.includes('\0')) continue; // binary

  const lines = text.split('\n');
  for (const rule of RULES) {
    for (let i = 0; i < lines.length; i++) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(lines[i])) !== null) {
        if (rule.keep(m)) fail(file, i + 1, rule.what, rule.redact(m));
      }
    }
  }

  if (isEnvStyle(file)) {
    for (let i = 0; i < lines.length; i++) {
      for (const hit of envAssignments(lines[i], { template: isEnvTemplate(file) })) {
        fail(file, i + 1, 'secret-named variable with a real-looking value', `${hit.name}=***`);
      }
    }
  }
}

if (failures.length) {
  console.log('Credential-shaped strings in tracked files:\n');
  for (const f of failures) {
    console.log(`  x ${f.file}:${f.line}  ${f.what}`);
    console.log(`      ${f.text}`);
  }
  console.log(
    '\nA committed credential is not fixed by deleting the file - it stays in history.',
  );
  console.log(
    'Revoke or delete it at the provider first, then remove it here. See issue #1406.',
  );
  process.exit(1);
}

console.log(`Scanned ${files.length} tracked files. No credential-shaped strings.`);
console.log(`Allowlisted env files: ${[...ENV_FILE_ALLOWLIST.keys()].join(', ') || 'none'}.`);
