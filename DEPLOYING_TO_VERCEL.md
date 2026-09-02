# Deploying PentAI to Vercel

PentAI is a standard Next.js App Router project, so Vercel deploys it with zero configuration.

## Steps

1. Push this repository to GitHub (or GitLab / Bitbucket) and import it in Vercel.
2. Vercel auto-detects Next.js — no custom build command or output directory is needed.
3. In **Project Settings → Environment Variables**, add your Supabase credentials:

   | Variable | Description |
   |----------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (publishable) key |

   These are the only environment variables the app reads. Provider keys for OpenRouter and Gemini
   are supplied by each user at runtime through the in-app Settings panel and are never stored
   on the server.

4. In your **Supabase** project, add the deployed URL as an OAuth redirect:
   `https://your-domain.vercel.app/auth/callback`
5. Deploy.

## Notes

- Server-side API routes live in `app/api/*`. They act as thin proxies to OpenRouter and Gemini
  using the key supplied in each request body, so they need no secrets of their own.
- Without the Supabase variables set, the app still builds and the landing page renders, but login
  fails with a "Missing Supabase environment variables" message.
