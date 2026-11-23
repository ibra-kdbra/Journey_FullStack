import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import * as schema from '../../src/lib/db/models/index';

const { db } = vi.hoisted(() => ({ db: {} as { d?: unknown } }));

vi.mock('$lib/server/database', async () => {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const s = await import('../../src/lib/db/models/index');
  const c = createClient({ url: ':memory:' });
  const d = drizzle(c, { schema: s, casing: 'snake_case' });
  db.d = d;
  return { default: d, client: c };
});
vi.mock('$env/static/public', () => ({ PUBLIC_BASE_URL: 'http://localhost' }));
vi.mock('$lib/utils/mail/mailer', () => ({ Emails: { TeamInvite: 'x' }, sendEmail: vi.fn() }));
vi.mock('sveltekit-flash-message/server', () => ({
  redirect: (...args: unknown[]) => {
    throw Object.assign(new Error('redirect'), { redirected: true, args });
  }
}));

import { actions } from '../../src/routes/(dashboard)/settings/teams/[teamPublicId]/+page.server';
import { actions as resetActions } from '../../src/routes/(auth)/reset-password/update/+page.server';
import { getTeamByPublicIdWithRelationsQuery, getTeamsByUserIdQuery } from '../../src/lib/db/queries/team';

const d = () => db.d as ReturnType<typeof drizzle<typeof schema>>;

function ev(user: { id: number; email?: string } | null, form: Record<string, string>) {
  const url = 'http://x/';
  return {
    locals: { user },
    url: new URL(url),
    request: new Request(url, { method: 'POST', body: new URLSearchParams(form) }),
    cookies: { set: vi.fn(), get: vi.fn(), delete: vi.fn(), getAll: vi.fn(), serialize: vi.fn() }
  } as never;
}

async function outcome(fn: () => unknown) {
  try {
    const r = await fn();
    return { returned: r } as { returned?: { status?: number }; status?: number; redirected?: boolean };
  } catch (e) {
    return e as { status?: number; redirected?: boolean };
  }
}

// Seed: team 1 has admin (user 1) and member (user 2); user 3 is an outsider.
async function seed() {
  for (const t of [schema.UsersTeams, schema.Invite, schema.Token, schema.Team, schema.User]) await d().delete(t);
  await d()
    .insert(schema.User)
    .values([
      {
        id: 1,
        email: 'admin@example.com',
        firstName: 'A',
        lastName: 'A',
        hashedPassword: 'secret-hash-1',
        googleId: 'g1'
      },
      { id: 2, email: 'member@example.com', firstName: 'M', lastName: 'M', hashedPassword: 'secret-hash-2' },
      { id: 3, email: 'out@example.com', firstName: 'O', lastName: 'O', hashedPassword: 'old-hash' }
    ]);
  await d().insert(schema.Team).values({ id: 1, publicId: 'team-one', name: 'one' });
  await d()
    .insert(schema.UsersTeams)
    .values([
      { teamId: 1, userId: 1, role: 'admin' },
      { teamId: 1, userId: 2, role: 'member' }
    ]);
}

describe('team actions authorization', () => {
  beforeAll(async () => {
    await migrate(d(), { migrationsFolder: 'src/lib/db/migrations' });
  });
  beforeEach(seed);

  const names = async () => (await d().select().from(schema.Team)).map((t) => t.name);
  const memberIds = async () => (await d().select().from(schema.UsersTeams)).map((m) => m.userId).sort();

  it('anonymous callers get 401 on every action', async () => {
    for (const [name, form] of [
      ['editTeam', { teamId: '1', name: 'hacked' }],
      ['deleteTeam', { teamId: '1' }],
      ['createTeamInvite', { teamId: '1', email: 'x@example.com' }],
      ['leaveTeam', { teamId: '1', userId: '2' }]
    ] as const) {
      const r = await outcome(() => actions[name](ev(null, form)));
      expect(r.status, name).toBe(401);
    }
    expect(await names()).toEqual(['one']);
    expect(await memberIds()).toEqual([1, 2]);
  });

  it('non-members get 403 and change nothing', async () => {
    const u = { id: 3, email: 'out@example.com' };
    expect((await outcome(() => actions.editTeam(ev(u, { teamId: '1', name: 'hacked' })))).status).toBe(403);
    expect((await outcome(() => actions.deleteTeam(ev(u, { teamId: '1' })))).status).toBe(403);
    expect((await outcome(() => actions.createTeamInvite(ev(u, { teamId: '1', email: 'x@example.com' })))).status).toBe(
      403
    );
    expect((await outcome(() => actions.leaveTeam(ev(u, { teamId: '1', userId: '1' })))).status).toBe(403);
    expect(await names()).toEqual(['one']);
    expect(await memberIds()).toEqual([1, 2]);
    expect(await d().select().from(schema.Invite)).toHaveLength(0);
  });

  it('plain members cannot edit, delete or invite', async () => {
    const u = { id: 2, email: 'member@example.com' };
    expect((await outcome(() => actions.editTeam(ev(u, { teamId: '1', name: 'hacked' })))).status).toBe(403);
    expect((await outcome(() => actions.deleteTeam(ev(u, { teamId: '1' })))).status).toBe(403);
    expect((await outcome(() => actions.createTeamInvite(ev(u, { teamId: '1', email: 'x@example.com' })))).status).toBe(
      403
    );
    expect(await names()).toEqual(['one']);
    expect(await d().select().from(schema.Invite)).toHaveLength(0);
  });

  it('a member cannot remove another member, but can leave themselves', async () => {
    const u = { id: 2, email: 'member@example.com' };
    expect((await outcome(() => actions.leaveTeam(ev(u, { teamId: '1', userId: '1' })))).status).toBe(403);
    expect(await memberIds()).toEqual([1, 2]);
    expect((await outcome(() => actions.leaveTeam(ev(u, { teamId: '1', userId: '2' })))).redirected).toBe(true);
    expect(await memberIds()).toEqual([1]);
  });

  it('admins can edit, invite and delete', async () => {
    const u = { id: 1, email: 'admin@example.com' };
    expect((await outcome(() => actions.editTeam(ev(u, { teamId: '1', name: 'renamed' })))).redirected).toBe(true);
    expect(await names()).toEqual(['renamed']);
    expect(
      (await outcome(() => actions.createTeamInvite(ev(u, { teamId: '1', email: 'x@example.com' })))).redirected
    ).toBe(true);
    expect(await d().select().from(schema.Invite)).toHaveLength(1);
    expect((await outcome(() => actions.deleteTeam(ev(u, { teamId: '1' })))).redirected).toBe(true);
    expect(await names()).toEqual([]);
  });
});

describe('team queries do not expose credentials', () => {
  beforeAll(async () => {
    await migrate(d(), { migrationsFolder: 'src/lib/db/migrations' });
  });
  beforeEach(seed);

  it('member users carry no hashedPassword or googleId', async () => {
    const team = await getTeamByPublicIdWithRelationsQuery.execute({ publicId: 'team-one' });
    const userTeams = await getTeamsByUserIdQuery.execute({ id: 1 });
    const json = JSON.stringify([team, userTeams]);
    expect(json).toContain('admin@example.com');
    expect(json).not.toMatch(/hashedPassword|googleId|secret-hash/);
  });
});

describe('reset-password action', () => {
  beforeAll(async () => {
    await migrate(d(), { migrationsFolder: 'src/lib/db/migrations' });
  });
  beforeEach(seed);

  const submit = (form: Record<string, string>) =>
    outcome(() =>
      resetActions.reset(ev(null, { password: 'newpassword', passwordConfirmation: 'newpassword', ...form }))
    );
  const hash = async (id: number) =>
    (await d().select().from(schema.User).where(eq(schema.User.id, id)))[0].hashedPassword;

  it('rejects an unknown token without changing the password', async () => {
    await submit({ email: 'out@example.com', token: 'bogus' });
    expect(await hash(3)).toBe('old-hash');
  });

  it('rejects an expired token', async () => {
    await d()
      .insert(schema.Token)
      .values({ key: 'expired', userId: 3, expiresAt: Date.now() - 1000 });
    await submit({ email: 'out@example.com', token: 'expired' });
    expect(await hash(3)).toBe('old-hash');
  });

  it("rejects a valid token used with another user's email", async () => {
    await d()
      .insert(schema.Token)
      .values({ key: 'mine', userId: 3, expiresAt: Date.now() + 60_000 });
    await submit({ email: 'admin@example.com', token: 'mine' });
    expect(await hash(1)).toBe('secret-hash-1');
    expect(await hash(3)).toBe('old-hash');
  });

  it("changes only the token owner's password and consumes the token", async () => {
    await d()
      .insert(schema.Token)
      .values({ key: 'good', userId: 3, expiresAt: Date.now() + 60_000 });
    const r = await submit({ email: 'out@example.com', token: 'good' });
    expect(r.redirected).toBe(true);
    expect(await hash(3)).not.toBe('old-hash');
    expect(await hash(1)).toBe('secret-hash-1');
    expect(await d().select().from(schema.Token)).toHaveLength(0);
  });
});
