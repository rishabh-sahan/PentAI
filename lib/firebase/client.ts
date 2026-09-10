import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/*
  Browser-side Firebase.

  Everything here is public by design — Firebase's web config identifies the
  project, it does not authorise anything. Access control lives entirely in
  Firestore Security Rules (firestore.rules) and in the server-side session
  checks, never in the secrecy of these values.

  Initialised lazily so that importing this module during prerender, or with
  the env vars unset, doesn't throw at build time.
*/

/*
  Dashboard env fields keep whatever whitespace was pasted into them, and a
  stray newline is invisible there but fatal here: an authDomain ending in one
  produced "https://host%0A/__/auth/iframe", which Firebase rejects outright.
  Take only the first non-empty line so a bad paste degrades to the intended
  value instead of a cryptic runtime failure.
*/
const clean = (value: string | undefined) =>
  value?.split('\n').map((line) => line.trim()).find(Boolean);

const config = {
  apiKey: clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Missing Firebase environment variables. See README → Quick start.'
    );
  }
  return getApps().length ? getApp() : initializeApp(config);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
