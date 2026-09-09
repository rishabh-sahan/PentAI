import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

import { getAdminAuth, isAdminConfigured } from '@/lib/firebase/admin';
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from '@/lib/auth/constants';

export const maxDuration = 15;

/*
  Exchanges a Firebase ID token (held by the client SDK, in IndexedDB) for an
  httpOnly session cookie.

  This exists because middleware and route handlers cannot read IndexedDB — so
  without a cookie there is no way to check who is calling on the server, which
  is precisely why the previous auth gate was cosmetic.

  The cookie is httpOnly and SameSite=Lax: script on the page cannot read it,
  and it is not sent on cross-site POSTs.
*/

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return Response.json(
      { error: 'Server auth is not configured. Set the FIREBASE_* variables.' },
      { status: 500 }
    );
  }

  try {
    const { idToken } = await req.json();

    if (typeof idToken !== 'string' || !idToken) {
      return Response.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const auth = getAdminAuth();

    // Verify before minting. Without checkRevoked a token from a signed-out
    // session would still buy a fresh 14-day cookie.
    const decoded = await auth.verifyIdToken(idToken, true);

    // Refuse tokens that are already stale; Firebase recommends a recent login
    // before issuing a long-lived cookie.
    const authTimeMs = decoded.auth_time * 1000;
    if (Date.now() - authTimeMs > 5 * 60 * 1000) {
      return Response.json(
        { error: 'Sign-in is too old. Please sign in again.' },
        { status: 401 }
      );
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    (await cookies()).set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    return Response.json({ ok: true, uid: decoded.uid });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Could not create session' },
      { status: 401 }
    );
  }
}

/** Sign out: clear the cookie and revoke refresh tokens so it can't be reused. */
export async function DELETE() {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;

  if (existing && isAdminConfigured()) {
    try {
      const auth = getAdminAuth();
      const decoded = await auth.verifySessionCookie(existing, false);
      await auth.revokeRefreshTokens(decoded.sub);
    } catch {
      // Already invalid — clearing the cookie below is enough.
    }
  }

  store.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
