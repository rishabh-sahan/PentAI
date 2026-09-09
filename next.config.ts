import type { NextConfig } from "next";

/*
  Serve Firebase's auth handler from this origin.

  signInWithRedirect parks its pending state on the authDomain's origin. While
  that is <project>.firebaseapp.com, browsers that partition third-party storage
  (Edge tracking prevention, Safari ITP) drop it, so getRedirectResult() returns
  null on the way back and sign-in fails silently — no error, no user.

  Proxying /__/auth/* makes that storage first-party. It only takes effect once
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is set to the domain the app is served from;
  on localhost it stays <project>.firebaseapp.com, where popups work fine.
*/

const nextConfig: NextConfig = {
  async rewrites() {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) return [];

    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${projectId}.firebaseapp.com/__/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
