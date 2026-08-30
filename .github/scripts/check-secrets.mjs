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
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const failures = [];
const fail = (file, line, what, text) =>
  failures.push({ file, line, what, text });

// Hosts that are not a secret to reach, and values that announce themselves as
// fake. A connection string to localhost is configuration, not a leak.
const BENIGN_HOST = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|db|database|postgres|mysql|redis|host\.docker\.internal|example\.(com|org|invalid)|.*\.example|.*\.invalid|.*\.local)$/i;
const BENIGN_SECRET = /^(postgres|password|passwd|pass|secret|changeme|root|admin|test|example|placeholder|your[-_]?password|\$?\{[^}]+\}|<[^>]+>|\*+|x+)$/i;

const RULES = [
  {
    what: 'connection string with an embedded password',
    // scheme://user:secret@host - the host group decides whether it matters
    re: /\b([a-z][a-z0-9+.-]*):\/\/([^\s:/@]+):([^\s:/@]+)@([^\s:/?#]+)/gi,
    keep: (m) => {
      const host = m[4].split(':')[0];
      // `https://mailto:someone@example.com` parses as user "mailto" with the
      // address as the password. It is a malformed link, not a credential.
      if (m[2].toLowerCase() === 'mailto') return false;
      return !BENIGN_HOST.test(host) && !BENIGN_SECRET.test(m[3]);
    },
    redact: (m) => `${m[1]}://${m[2]}:***@${m[4]}`,
  },
  {
    what: 'AWS access key id',
    re: /\b((?:AKIA|ASIA)[0-9A-Z]{16})\b/g,
    keep: () => true,
    redact: (m) => `${m[1].slice(0, 8)}...`,
  },
  {
    what: 'GitHub token',
    re: /\b((?:ghp|gho|ghu|ghs|ghr|github_pat)_[A-Za-z0-9_]{20,})\b/g,
    keep: () => true,
    redact: (m) => `${m[1].slice(0, 10)}...`,
  },
  {
    what: 'private key block',
    re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
    keep: () => true,
    redact: (m) => m[0],
  },
];

// .env.example exists to name variables without values; docs quote incidents on
// purpose. Both would otherwise be permanent false positives.
const SKIP_PATH = /(^|\/)(\.env\.example|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lock|poetry\.lock)$|^docs\//;

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((f) => !SKIP_PATH.test(f));

for (const file of files) {
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
