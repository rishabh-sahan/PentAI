# Deploying PentAI to Vercel

This project is ready to deploy to Vercel (Next.js App Router). Follow these steps:

1. Create a Vercel account and connect your Git provider (GitHub/GitLab/Bitbucket).
2. Push this repository to your remote (e.g., GitHub) and import it in Vercel.
3. In the Vercel project settings → Environment Variables, add the API keys you'll use at runtime (these are example names used by the app):

   - `OPENROUTER_API_KEY` — OpenRouter API key (optional, used for OpenRouter models)
   - `GOOGLE_GENERATIVE_AI_API_KEY` — Google Generative API / Gemini key (optional, used for Gemini)
   - `SUPABASE_URL` — (if using Supabase features)
   - `SUPABASE_ANON_KEY` — (if using Supabase features)

4. Build settings: Vercel will auto-detect Next.js. The project includes a `vercel-build` script and `vercel.json` to help Vercel detect the app. No custom build command is necessary (the default `npm run build` or `yarn build` will be used).

5. Deploy. After deployment, visit the Vercel dashboard to view logs and set additional environment variables or secrets as needed.

Notes:
- Server-side API routes are in `app/api/*` — they use standard fetch calls and require the appropriate provider API keys to be set in Vercel.
- If you need higher concurrency or different runtime (Edge), you can add `export const runtime = 'edge'` to individual route handlers.

Optional follow-ups I can do for you:
- Add a GitHub Action to build and run tests on pushes.
- Add a `vercel` CLI workflow or sample preview deployment steps.

Tell me which (if any) you want next.
