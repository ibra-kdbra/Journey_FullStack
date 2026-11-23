import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Everything not listed here requires a signed-in Clerk session.
const isPublicRoute = createRouteMatcher([
  '/',
  '/site(.*)',
  '/about(.*)',
  '/features(.*)',
  '/pricing(.*)',
  '/documentation(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/agency/sign-in(.*)',
  '/agency/sign-up(.*)',
  // Stripe calls the webhook server-to-server; it verifies the signature itself.
  '/api/stripe/webhook',
  // Public funnel checkout. The route validates the connected account and
  // price ids against the database and applies an origin allowlist.
  '/api/stripe/create-checkout-session',
  // UploadThing callbacks come from UploadThing servers; the file router
  // authenticates the uploading user in its own middleware.
  '/api/uploadthing(.*)',
])

// Published funnels are served from /<subdomain>./<page> and must stay public.
const isPublicFunnelPath = (pathname: string) => {
  const first = pathname.split('/')[1] ?? ''
  return first.endsWith('.') && pathname.split('/').length >= 3
}

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl

  // Redirect sign-in and sign-up to the agency sign-in page
  if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
    return NextResponse.redirect(new URL('/agency/sign-in', req.url))
  }

  if (isPublicRoute(req) || isPublicFunnelPath(url.pathname)) {
    // Rewrite root path to /site
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/site', req.url))
    }
    return NextResponse.next()
  }

  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/trpc')) {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  await auth.protect()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
