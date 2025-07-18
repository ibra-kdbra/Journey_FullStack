// Types
import type { RequestEvent } from '@sveltejs/kit';

// Utils
import { redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';

// Database
import db from '$lib/server/database';
import { User } from '$models/user';
import { Session, type Session as SessionType } from '$models/session';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = '__auth_session';

export function generateSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const token = encodeBase64url(bytes);
  return token;
}

export async function createSession(token: string, userId: number) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: SessionType = {
    id: sessionId,
    userId,
    expiresAt: Date.now() + DAY_IN_MS * 30
  };
  await db.insert(Session).values(session);
  return session;
}

export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const [result] = await db
    .select({
      // Adjust user table here to tweak returned data
      user: {
        id: User.id,
        email: User.email,
        firstName: User.firstName,
        lastName: User.lastName,
        avatar: User.avatar
      },
      session: Session
    })
    .from(Session)
    .innerJoin(User, eq(Session.userId, User.id))
    .where(eq(Session.id, sessionId));

  if (!result) {
    return { session: null, user: null };
  }
  const { session, user } = result;

  const sessionExpired = Date.now() >= session.expiresAt;
  if (sessionExpired) {
    await db.delete(Session).where(eq(Session.id, session.id));
    return { session: null, user: null };
  }

  const renewSession = Date.now() >= session.expiresAt - DAY_IN_MS * 15;
  if (renewSession) {
    const newExpiresAt = Date.now() + DAY_IN_MS * 30;
    session.expiresAt = newExpiresAt;
    await db.update(Session).set({ expiresAt: newExpiresAt }).where(eq(Session.id, session.id));
  }

  return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
  await db.delete(Session).where(eq(Session.id, sessionId));
}

export async function invalidateUserSessions(userId: number) {
  await db.delete(Session).where(eq(Session.userId, userId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: number) {
  event.cookies.set(sessionCookieName, token, {
    expires: new Date(expiresAt),
    path: '/'
  });
}

export function deleteSessionTokenCookie(event: RequestEvent) {
  event.cookies.delete(sessionCookieName, {
    path: '/'
  });
}

export function requireLogin() {
  const { locals, url } = getRequestEvent();

  if (!locals.user) {
    const location = new URL('/login', url.origin);

    redirect(307, location);
  }

  return locals.user;
}
