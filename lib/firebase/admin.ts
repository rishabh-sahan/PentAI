import 'server-only';

import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

/*
  Server-side Firebase Admin.

  This is the trust boundary: the browser can claim anything, so every
  privileged decision is made here by verifying a signed session cookie.

  The service account is a real secret — unlike the client config in
  ./client.ts — and must never be prefixed NEXT_PUBLIC_.
*/

const ADMIN_APP_NAME = 'pentai-admin';

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

function getAdminApp(): App {
  const existing = getApps().find((a) => a.name === ADMIN_APP_NAME);
  if (existing) return existing;

  if (!isAdminConfigured()) {
    throw new Error(
      'Missing Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
    );
  }

  return initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Dashboards and .env files store the PEM with literal \n sequences.
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    },
    ADMIN_APP_NAME
  );
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export { getApp as getRawAdminApp };
