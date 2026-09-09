import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/lib/auth/constants';

/*
  Server-side gate for /dashboard.

  Previously the dashboard redirected from a useEffect, which meant the page and
  its JavaScript were already delivered before the check ran — a cosmetic guard.
  This runs before any HTML is sent.

  Note this only checks that a session cookie is *present*, not that it is
  valid: middleware runs on the edge runtime, where the Admin SDK (Node crypto)
  cannot run. Full cryptographic verification happens in the API routes via
  requireUser(), which is where the actual data lives. This layer stops
  unauthenticated page loads; it is not the security boundary on its own.
*/

export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '?login=1';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
