import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import * as schema from '../../src/lib/db/models/index';

const { db, claims, signed } = vi.hoisted(() => ({
  db: {} as { d?: unknown },
  claims: { value: {} as Record<string, unknown> },
  signed: { calls: [] as { input: Record<string, unknown>; expiresIn: number }[] }
}));

vi.mock('$lib/server/database', async () => {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const s = await import('../../src/lib/db/models/index');
  const c = createClient({ url: ':memory:' });
  const d = drizzle(c, { schema: s, casing: 'snake_case' });
  db.d = d;
  return { default: d, client: c };
});
vi.mock('$env/static/public', () => ({ PUBLIC_BASE_URL: 'http://localhost', PUBLIC_R2_BUCKET_NAME: 'bucket' }));
vi.mock('$lib/utils/mail/mailer', () => ({
  Emails: { Welcome: 'w', ResetPassword: 'r' },
  sendEmail: vi.fn()
}));
vi.mock('sveltekit-rate-limiter/server', () => ({
  RetryAfterRateLimiter: class {
    check = async () => ({ limited: false });
  }
}));
vi.mock('sveltekit-flash-message/server', () => ({
  setFlash: vi.fn(),
  redirect: (...args: unknown[]) => {
    throw Object.assign(new Error('redirect'), { redirected: true, args });
  }
}));
vi.mock('$lib/server/oauth', () => ({
  google: { validateAuthorizationCode: async () => ({ idToken: () => 'x' }) }
}));
vi.mock('arctic', () => ({ decodeIdToken: () => claims.value }));
vi.mock('$lib/server/storage', () => ({ s3: {} }));
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: async (_s3: unknown, cmd: { input: Record<string, unknown> }, o: { expiresIn: number }) => {
    signed.calls.push({ input: cmd.input, expiresIn: o.expiresIn });
    return 'https://signed.example/url';
  }
}));

import { GET as googleCallback } from '../../src/routes/(auth)/login/google/callback/+server';
import { actions as resetRequestActions } from '../../src/routes/(auth)/reset-password/+page.server';
import { actions as resetActions } from '../../src/routes/(auth)/reset-password/update/+page.server';
import { POST as upload } from '../../src/routes/api/upload/+server';

const d = () => db.d as ReturnType<typeof drizzle<typeof schema>>;

async function outcome(fn: () => unknown) {
  try {
    return { returned: await fn() } as { returned?: unknown; status?: number; redirected?: boolean };
  } catch (e) {
    return e as { status?: number; redirected?: boolean };
  }
}

async function seed() {
  for (const t of [schema.Session, schema.Token, schema.UsersTeams, schema.Team, schema.User]) await d().delete(t);
  await d()
    .insert(schema.User)
    .values({ id: 1, email: 'victim@example.com', firstName: 'V', lastName: 'V', hashedPassword: 'old-hash' });
  await d()
    .insert(schema.Session)
    .values({ id: 's1', userId: 1, expiresAt: Date.now() + 100_000 });
}

beforeAll(async () => {
  await migrate(d(), { migrationsFolder: 'src/lib/db/migrations' });
});
beforeEach(seed);

describe('google callback email verification', () => {
  const run = () =>
    outcome(() =>
      googleCallback({
        url: new URL('http://x/login/google/callback?code=c&state=st'),
        cookies: {
          get: (k: string) => (k === 'google_oauth_state' ? 'st' : 'cv'),
          set: vi.fn(),
          delete: vi.fn()
        }
      } as never)
    );
  const base = { sub: 'g-attacker', given_name: 'A', family_name: 'B', email: 'victim@example.com' };

  it('does not link or log in via an unverified email', async () => {
    claims.value = { ...base, email_verified: false };
    await run();
    const u = (await d().select().from(schema.User).where(eq(schema.User.id, 1)))[0];
    expect(u.googleId).toBeNull();
    expect(await d().select().from(schema.User)).toHaveLength(1);
    expect(await d().select().from(schema.Session)).toHaveLength(1);
  });

  it('does not register a new account with an unverified email', async () => {
    claims.value = { ...base, email: 'new@example.com', email_verified: false };
    await run();
    expect(await d().select().from(schema.User)).toHaveLength(1);
  });

  it('links to the existing account when the email is verified', async () => {
    claims.value = { ...base, email_verified: true };
    await run();
    const u = (await d().select().from(schema.User).where(eq(schema.User.id, 1)))[0];
    expect(u.googleId).toBe('g-attacker');
  });
});

describe('session revocation on password reset', () => {
  const sessions = async () => (await d().select().from(schema.Session)).length;
  const form = (f: Record<string, string>) =>
    ({
      locals: { user: null },
      url: new URL('http://x/'),
      getClientAddress: () => '127.0.0.1',
      request: new Request('http://x/', { method: 'POST', body: new URLSearchParams(f) }),
      cookies: { set: vi.fn(), get: vi.fn(), delete: vi.fn() }
    }) as never;

  it('requesting a reset leaves existing sessions valid', async () => {
    await outcome(() => resetRequestActions.requestPasswordReset(form({ email: 'victim@example.com' })));
    expect(await d().select().from(schema.Token)).toHaveLength(1);
    expect(await sessions()).toBe(1);
  });

  it('completing a reset deletes all sessions of that user', async () => {
    await d()
      .insert(schema.Token)
      .values({ key: 'good', userId: 1, expiresAt: Date.now() + 60_000 });
    const r = await outcome(() =>
      resetActions.reset(
        form({
          email: 'victim@example.com',
          token: 'good',
          password: 'newpassword',
          passwordConfirmation: 'newpassword'
        })
      )
    );
    expect(r.redirected).toBe(true);
    expect(await sessions()).toBe(0);
  });
});

describe('upload request validation', () => {
  const post = (body: unknown, user: unknown = { id: 1 }) =>
    outcome(() =>
      upload({
        locals: { user },
        request: new Request('http://x/api/upload', { method: 'POST', body: JSON.stringify(body) })
      } as never)
    ) as Promise<{ status?: number; returned?: Response }>;
  const ok = { fileType: 'image/png', fileSize: 1000, destinationDirectory: 'avatars' };

  beforeEach(() => {
    signed.calls.length = 0;
  });

  it.each([
    ['path traversal directory', { ...ok, destinationDirectory: '../x' }],
    ['unlisted directory', { ...ok, destinationDirectory: 'secrets' }],
    ['html type', { ...ok, fileType: 'text/html' }],
    ['loose image type', { ...ok, fileType: 'image/svg+xml' }],
    ['oversize', { ...ok, fileSize: 50_000_000 }],
    ['missing size', { fileType: 'image/png', destinationDirectory: 'avatars' }]
  ])('rejects %s with 400 and signs nothing', async (_n, body) => {
    const r = await post(body);
    expect(r.status).toBe(400);
    expect(signed.calls).toHaveLength(0);
  });

  it('rejects anonymous callers', async () => {
    expect((await post(ok, null)).status).toBe(401);
  });

  it('signs a valid request with a size limit and <= 5 minute expiry', async () => {
    const r = await post(ok);
    expect(r.returned?.status).toBe(200);
    expect(signed.calls).toHaveLength(1);
    expect(signed.calls[0].input).toMatchObject({ ContentType: 'image/png', ContentLength: 1000 });
    expect(String(signed.calls[0].input.Key)).toMatch(/^avatars\/[0-9a-f]{32}$/);
    expect(signed.calls[0].expiresIn).toBeLessThanOrEqual(300);
  });
});
