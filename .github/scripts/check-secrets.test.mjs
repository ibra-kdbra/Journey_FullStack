// Self-test for check-secrets.mjs: every rule must fire on a sample and stay quiet
// on the placeholder cases. Run with `node --test .github/scripts/check-secrets.test.mjs`.
//
// Samples are assembled at run time so this file does not itself contain a
// credential-shaped string for the scanner to flag.
import { strict as assert } from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  RULES,
  envAssignments,
  isEnvStyle,
  isForbiddenEnvFile,
} from './check-secrets-rules.mjs';

const hits = (what, text) => {
  const rule = RULES.find((r) => r.what === what);
  assert.ok(rule, `no rule named ${what}`);
  const out = [];
  rule.re.lastIndex = 0;
  let m;
  while ((m = rule.re.exec(text)) !== null) if (rule.keep(m)) out.push(m);
  return out.length;
};

test('connection string with an embedded password', () => {
  const what = 'connection string with an embedded password';
  assert.equal(hits(what, 'postgres://app:' + 'hunter2xyz' + '@db.prod.acme.io:5432/app'), 1);
  assert.equal(hits(what, 'postgres://postgres:postgres@localhost:5432/app'), 0);
  assert.equal(hits(what, 'postgres://app:${DB_PASSWORD}@db.prod.acme.io/app'), 0);
});

test('AWS access key id', () => {
  const what = 'AWS access key id';
  assert.equal(hits(what, 'id = ' + 'AKIA' + 'ABCDEFGHIJKLMNOP'), 1);
  assert.equal(hits(what, 'AKIA is a prefix'), 0);
});

test('GitHub token', () => {
  const what = 'GitHub token';
  assert.equal(hits(what, 'ghp' + '_' + 'a'.repeat(36)), 1);
  assert.equal(hits(what, 'ghp_short'), 0);
});

test('private key block', () => {
  const what = 'private key block';
  assert.equal(hits(what, '-----BEGIN ' + 'RSA PRIVATE KEY-----'), 1);
  assert.equal(hits(what, '-----BEGIN PUBLIC KEY-----'), 0);
});

test('Slack token', () => {
  const what = 'Slack token';
  assert.equal(hits(what, 'xoxb' + '-123456789012-abcdefghij'), 1);
  assert.equal(hits(what, 'xoxb-'), 0);
});

test('Stripe live secret key', () => {
  const what = 'Stripe live secret key';
  assert.equal(hits(what, 'sk_' + 'live_' + 'A1b2C3d4E5f6G7h8'), 1);
  assert.equal(hits(what, 'sk_' + 'test_' + 'A1b2C3d4E5f6G7h8'), 0);
});

test('Google API key', () => {
  const what = 'Google API key';
  assert.equal(hits(what, 'AIza' + 'Sy' + 'A'.repeat(33)), 1);
  assert.equal(hits(what, 'AIza-too-short'), 0);
});

test('tracked env files are forbidden unless they are templates or allowlisted', () => {
  assert.equal(isForbiddenEnvFile('vercel-cleaner/.env'), true);
  assert.equal(isForbiddenEnvFile('app/.env.local'), true);
  assert.equal(isForbiddenEnvFile('app/.env.production'), true);
  assert.equal(isForbiddenEnvFile('deploy/prod.env'), true);
  assert.equal(isForbiddenEnvFile('app/.env.example'), false);
  assert.equal(isForbiddenEnvFile('app/.env.sample'), false);
  assert.equal(isForbiddenEnvFile('app/.env-template'), false);
  assert.equal(isForbiddenEnvFile('nestjs-s.o.l.i.d/.env'), false); // allowlisted
  assert.equal(isForbiddenEnvFile('src/environment.ts'), false);
  assert.equal(isForbiddenEnvFile('src/env.d.ts'), false);
});

test('env-style detection includes templates', () => {
  assert.equal(isEnvStyle('a/.env.example'), true);
  assert.equal(isEnvStyle('a/config.ts'), false);
});

test('KEY=value rule fires on real-looking secrets', () => {
  const v = 'k9f2' + 'Qx7LmZ3p';
  assert.equal(envAssignments(`VERCEL_TOKEN=${v}`).length, 1);
  assert.equal(envAssignments(`export DB_PASSWORD="${v}"`).length, 1);
  assert.equal(envAssignments(`STRIPE_API_KEY = ${v}`).length, 1);
  assert.equal(envAssignments(`CLIENT_SECRET=${v} # prod`).length, 1);
});

test('KEY=value rule ignores placeholders, comments and unrelated names', () => {
  for (const line of [
    'VERCEL_TOKEN=',
    'VERCEL_TOKEN=""',
    'VERCEL_TOKEN=your_token_here',
    'DB_PASSWORD=<password>',
    'DB_PASSWORD=${DB_PASSWORD}',
    'API_KEY=changeme',
    'API_KEY=xxxxxxxx',
    'SECRET=password',
    '# VERCEL_TOKEN=abc123def456ghi',
    'MAX_TOKENS=2048',
    'DATABASE_URL=file:./dev.db',
    'PORT=3000',
  ]) {
    assert.equal(envAssignments(line).length, 0, line);
  }
});

test('templates also accept self-describing stand-ins; real env files do not', () => {
  assert.equal(envAssignments('DB_PASSWORD=my-secret-password', { template: true }).length, 0);
  assert.equal(envAssignments('DB_PASSWORD=my-secret-password').length, 1);
});

// End to end: the CLI exits non-zero on a repository that tracks a .env file, and
// zero once the file is a template or gone.
test('check-secrets.mjs fails a repo that tracks a .env file', () => {
  const script = join(dirname(fileURLToPath(import.meta.url)), 'check-secrets.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'check-secrets-'));
  const run = () => spawnSync('node', [script], { cwd: dir, encoding: 'utf8' });
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'ignore' });
  try {
    git('init', '-q');
    mkdirSync(join(dir, 'vercel-cleaner'));
    writeFileSync(join(dir, 'vercel-cleaner', '.env.example'), 'VERCEL_TOKEN=\n');
    git('add', '-A');
    assert.equal(run().status, 0);

    writeFileSync(join(dir, 'vercel-cleaner', '.env'), 'VERCEL_TOKEN=' + 'k9f2Qx7LmZ3p' + '\n');
    git('add', '-A');
    const failed = run();
    assert.equal(failed.status, 1);
    assert.match(failed.stdout, /vercel-cleaner\/\.env/);
    assert.doesNotMatch(failed.stdout, /k9f2Qx7LmZ3p/); // never echoes the value
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
