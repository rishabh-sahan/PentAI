"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult, onAuthStateChanged, signOut, type User } from "firebase/auth";

import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  configured: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();
  const router = useRouter();

  useEffect(() => {
    if (!configured) return;

    // Completes the LoginModal's popup-blocked fallback: after the provider
    // redirects back here, this resolves with the signed-in user. The cookie
    // itself is minted below by onAuthStateChanged, which fires either way.
    getRedirectResult(getFirebaseAuth())
      .then((result) => {
        if (result?.user) router.push("/dashboard");
      })
      .catch((err) => console.error("Redirect sign-in failed:", err));
  }, [configured, router]);

  useEffect(() => {
    if (!configured) {
      // No config (e.g. a preview deploy without env vars): don't hang on a
      // spinner forever, just report signed-out.
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      /*
        Keep the httpOnly session cookie in step with the client SDK.

        The SDK's own session lives in IndexedDB, which the server cannot read.
        Middleware and the API routes authorise off this cookie, so if the two
        drift the user ends up "signed in" in the UI while every request 401s.
      */
      if (nextUser) {
        try {
          const idToken = await nextUser.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        } catch (err) {
          console.error("Could not establish server session:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [configured]);

  const logout = async () => {
    try {
      // Clear the server cookie first: if the page unloads midway, a stale
      // cookie is worse than a stale client session.
      await fetch("/api/auth/session", { method: "DELETE" });
      if (configured) await signOut(getFirebaseAuth());
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, configured, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
