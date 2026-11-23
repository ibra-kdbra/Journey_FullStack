import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import * as schema from '../../src/lib/db/models/index';

// Real in-memory database so the actual where-conditions are executed.
const { client, db } = vi.hoisted(() => ({ client: {} as { c?: unknown }, db: {} as { d?: unknown } }));

vi.mock('$lib/server/database', async () => {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const s = await import('../../src/lib/db/models/index');
  const c = createClient({ url: ':memory:' });
  const d = drizzle(c, { schema: s, casing: 'snake_case' });
  client.c = c;
  db.d = d;
  return { default: d, client: c };
});

import { GET, POST } from '../../src/routes/api/invites/+server';

const email = 'invitee@example.com';

function event(init: { method: 'GET' | 'POST'; url: string; form?: Record<string, string> }) {
  const body = init.form ? new URLSearchParams(init.form) : undefined;
  return {
    locals: { user: { id: 1, email } },
    url: new URL(init.url),
    request: new Request(init.url, { method: init.method, body }),
    cookies: { set: vi.fn(), get: vi.fn(), delete: vi.fn(), getAll: vi.fn(), serialize: vi.fn() }
  } as never;
}

async function run(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (e) {
    return e as { status: number; location: string };
  }
  throw new Error('expected a redirect');
}

describe('/api/invites', () => {
  const d = () => db.d as ReturnType<typeof drizzle<typeof schema>>;

  beforeAll(async () => {
    await migrate(d(), { migrationsFolder: 'src/lib/db/migrations' });
  });

  beforeEach(async () => {
    await d().delete(schema.UsersTeams);
    await d().delete(schema.Invite);
    await d().delete(schema.User);
    await d().delete(schema.Team);
    await d().insert(schema.User).values({ id: 1, email, firstName: 'A', lastName: 'B' });
    await d()
      .insert(schema.Team)
      .values([
        { id: 1, name: 'one' },
        { id: 2, name: 'two' }
      ]);
    await d()
      .insert(schema.Invite)
      .values({ teamId: 1, email, token: 'tok', expiresAt: Date.now() + 60_000 });
  });

  it('rejects an invite when the team param does not match the token', async () => {
    const res = await run(() =>
      POST(event({ method: 'POST', url: 'http://x/api/invites', form: { teamId: '2', token: 'tok' } }))
    );
    expect(res.location).toBe('/');
    expect(await d().select().from(schema.UsersTeams)).toHaveLength(0);
    expect((await d().select().from(schema.Invite).where(eq(schema.Invite.token, 'tok')))[0].status).toBe('pending');
  });

  it('accepts a matching invite via POST', async () => {
    const res = await run(() =>
      POST(event({ method: 'POST', url: 'http://x/api/invites', form: { teamId: '1', token: 'tok' } }))
    );
    expect(res.location).toBe('/settings/teams');
    expect(await d().select().from(schema.UsersTeams)).toHaveLength(1);
  });

  it('does not modify data on GET', async () => {
    const res = await run(() => GET(event({ method: 'GET', url: 'http://x/api/invites?team=1&token=tok' })));
    expect(res.location).toBe('/settings/teams');
    expect(await d().select().from(schema.UsersTeams)).toHaveLength(0);
    expect((await d().select().from(schema.Invite))[0].status).toBe('pending');
  });
});
