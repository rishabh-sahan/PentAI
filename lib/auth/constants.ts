/*
  Edge-safe auth constants.

  Deliberately dependency-free. `middleware.ts` runs on the Edge runtime, and
  importing these from lib/auth/session.ts would drag in firebase-admin — which
  needs Node built-ins like `node:net` and fails the build outright.

  Anything added here must stay importable from the Edge runtime.
*/

/** Name of the httpOnly session cookie minted by /api/auth/session. */
export const SESSION_COOKIE = 'pentai_session';

/** Firebase caps session cookies at 14 days. */
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
