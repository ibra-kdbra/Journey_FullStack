import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
export const forbidden = () =>
  NextResponse.json({ error: 'Forbidden' }, { status: 403 })

/** Returns the Clerk user id of the caller, or null when signed out. */
export async function requireUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId ?? null
}

/**
 * Returns the database user (with agencyId) for the signed-in caller if, and
 * only if, they are an agency owner/admin. Otherwise returns null.
 */
export async function getAgencyAdmin() {
  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress
  if (!email) return null
  const user = await db.user.findUnique({ where: { email } })
  if (!user || !user.agencyId) return null
  if (user.role !== 'AGENCY_OWNER' && user.role !== 'AGENCY_ADMIN') return null
  return user
}

/**
 * Origins allowed to call the public checkout endpoint cross-origin:
 * the app's own origin, any published-funnel subdomain of the platform
 * domain, and anything listed in CHECKOUT_ALLOWED_ORIGINS (comma separated).
 */
export function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false
  let parsed: URL
  try {
    parsed = new URL(origin)
  } catch {
    return false
  }
  const extra = (process.env.CHECKOUT_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  if (extra.includes(parsed.origin)) return true

  const appUrl = process.env.NEXT_PUBLIC_URL
  if (appUrl) {
    try {
      if (new URL(appUrl).origin === parsed.origin) return true
    } catch {}
  }

  const domain = process.env.NEXT_PUBLIC_DOMAIN
  if (domain) {
    const host = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    const bare = host.split(':')[0]
    const scheme = process.env.NEXT_PUBLIC_SCHEME
      ? process.env.NEXT_PUBLIC_SCHEME.replace(/:?\/*$/, '') + ':'
      : null
    if (
      (!scheme || parsed.protocol === scheme) &&
      (parsed.hostname === bare || parsed.hostname.endsWith('.' + bare))
    ) {
      return true
    }
  }
  return false
}

export function corsHeaders(origin: string | null): Record<string, string> {
  if (!isAllowedOrigin(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}
