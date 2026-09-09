import 'server-only';

import { cookies } from 'next/headers';
import type { DecodedIdToken } from 'firebase-admin/auth';

import { getAdminAuth, isAdminConfigured } from '@/lib/firebase/admin';
import { SESSION_COOKIE } from './constants';

export { SESSION_COOKIE, SESSION_MAX_AGE_MS } from './constants';

/**
 * Returns the verified user, or null.
 *
 * `checkRevoked` is deliberately on: without it a signed-out or disabled
 * user's cookie keeps working until it expires, which is exactly the kind of
 * "logged out but still authorised" gap that makes a session check decorative.
 */
export async function getSessionUser(): Promise<DecodedIdToken | null> {
  if (!isAdminConfigured()) return null;

  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    return await getAdminAuth().verifySessionCookie(cookie, true);
  } catch {
    // Expired, revoked, or tampered with — all equally "not signed in".
    return null;
  }
}

/**
 * Guard for route handlers. Returns either the user or a ready-to-return 401,
 * so a route can bail in one line without inventing its own error shape.
 */
export async function requireUser(): Promise<
  { user: DecodedIdToken; response: null } | { user: null; response: Response }
> {
  const user = await getSessionUser();

  if (!user) {
    return {
      user: null,
      response: Response.json(
        { error: 'Not signed in.', code: 401 },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}
