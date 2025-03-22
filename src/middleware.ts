import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(
  (auth, req) => {
    const url = req.nextUrl;

    // Allow public routes to proceed without rewriting
    if (
      url.pathname === '/(main)/about' ||
      url.pathname === '/site' ||
      url.pathname === '/test'
    ) {
      return NextResponse.next();
    }

    // Redirect sign-in and sign-up to the agency sign-in page
    if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
      return NextResponse.redirect(new URL('/agency/sign-in', req.url));
    }

    // Rewrite root path to /site
    if (url.pathname === '/') {
      console.log('Rewriting / to /site');
      return NextResponse.rewrite(new URL('/site', req.url));
    }

    // Allow agency and subaccount routes to proceed
    if (url.pathname.startsWith('/agency') || url.pathname.startsWith('/subaccount')) {
      return NextResponse.next();
    }

    // Protect all other routes
    // auth().protect();
  }
);

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};