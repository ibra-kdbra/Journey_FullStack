/**
 * Detection rules for check-secrets.mjs, kept apart so check-secrets.test.mjs can
 * prove each one fires on a sample and stays quiet on the placeholder cases.
 */

// Hosts that are not a secret to reach, and values that announce themselves as
// fake. A connection string to localhost is configuration, not a leak.
const BENIGN_HOST = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|db|database|postgres|mysql|redis|host\.docker\.internal|example\.(com|org|invalid)|.*\.example|.*\.invalid|.*\.local)$/i;
const BENIGN_SECRET = /^(postgres|password|passwd|pass|secret|changeme|root|admin|test|example|placeholder|your[-_]?password|\$?\{[^}]+\}|<[^>]+>|\*+|x+)$/i;

export const RULES = [
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

// Vendor shapes. Each is a prefix no ordinary text carries, followed by enough
// entropy-looking characters to be a real key rather than a mention of one.
RULES.push(
  {
    what: 'Slack token',
    re: /\b(xox[abposr]-[A-Za-z0-9-]{10,})\b/g,
    keep: () => true,
    redact: (m) => `${m[1].slice(0, 8)}...`,
  },
  {
    what: 'Stripe live secret key',
    re: /\b((?:sk|rk)_live_[A-Za-z0-9]{16,})\b/g,
    keep: () => true,
    redact: (m) => `${m[1].slice(0, 8)}...`,
  },
  {
    what: 'Google API key',
    re: /\b(AIza[0-9A-Za-z_-]{35})\b/g,
    keep: () => true,
    redact: (m) => `${m[1].slice(0, 8)}...`,
  },
);

// ---- tracked env files ------------------------------------------------------

// A file that is *meant* to be committed because it names variables, not values.
export const ENV_TEMPLATE = /^\.env([.-])(example|sample|template|dist)$/i;
// Anything else called .env, .env.local, .env.production, prod.env ...
export const ENV_FILE = /^(\.env([.-].+)?|.+\.env)$/i;

// Tracked env files that are deliberately committed. Add to this list only with
// a reason, and only for a file that holds no secret.
export const ENV_FILE_ALLOWLIST = new Map([
  [
    'nestjs-s.o.l.i.d/.env',
    'holds only a relative SQLite DATABASE_URL (file:./...); Prisma 7 reads it from here',
  ],
  [
    'rn_clean_architecture/ios/.xcode.env',
    'the Xcode-versioned file that sets NODE_BINARY; the local override is .xcode.env.local',
  ],
]);

export const basename = (file) => file.slice(file.lastIndexOf('/') + 1);

export const isForbiddenEnvFile = (file) => {
  const name = basename(file);
  if (ENV_TEMPLATE.test(name)) return false;
  if (!ENV_FILE.test(name)) return false;
  return !ENV_FILE_ALLOWLIST.has(file);
};

export const isEnvTemplate = (file) => ENV_TEMPLATE.test(basename(file));

// Env-style files, templates included: a template full of live values is still a leak.
export const isEnvStyle = (file) => {
  const name = basename(file);
  return ENV_FILE.test(name) || ENV_TEMPLATE.test(name);
};

// ---- KEY=value --------------------------------------------------------------

const SECRET_NAME = /(TOKEN(?!S)|SECRET|PASSWORD|PASSWD|API_?KEY|PRIVATE_?KEY|ACCESS_?KEY)/i;
// Values that say "fill me in" or are obviously not real.
const PLACEHOLDER_VALUE = /^(|your[-_ ]?.*|<.*>|\$\{.*\}|\$\(.*\)|\$[A-Z_][A-Z0-9_]*|changeme.*|change[-_]me.*|replace[-_ ]?me.*|xxx+|\*+|\.{3,}|todo|tbd|none|null|true|false|test|testing|example.*|placeholder.*|dummy.*|fake.*|secret|password|passwd|pass|token|key|api[-_]?key|admin|root|postgres)$/i;

// In a template, a value that names itself as a stand-in ("my-secret-password")
// is a placeholder too. Real env files get no such leniency.
const TEMPLATE_PLACEHOLDER = /(password|secret|example|placeholder|changeme|change-me|your|dummy|fake|sample)/i;

// Returns the matches in one line of an env-style file, or [].
export const envAssignments = (line, { template = false } = {}) => {
  const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
  if (!m || line.trim().startsWith('#')) return [];
  if (!SECRET_NAME.test(m[1])) return [];
  let value = m[2];
  const quoted = /^(["'])(.*)\1/.exec(value);
  value = quoted ? quoted[2] : value.replace(/\s+#.*$/, '');
  if (PLACEHOLDER_VALUE.test(value.trim())) return [];
  if (template && TEMPLATE_PLACEHOLDER.test(value)) return [];
  return [{ name: m[1] }];
};
