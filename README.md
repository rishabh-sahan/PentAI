# PentAI

Ask once, compare every AI's answer side by side.

PentAI sends a single prompt to up to five AI models at the same time and lays their answers out in
aligned columns, so you can judge which one actually got it right instead of opening five tabs.

## ✨ Features

- **One prompt, five answers** — models are called in parallel, so you wait for the slowest, not the sum
- **Live free-model catalog** — every free model OpenRouter currently offers, fetched at runtime rather than hardcoded
- **Bring your own keys** — stored in your browser, never on a server
- **Image input** — attach an image to a prompt for Gemini models
- **Persistent threads** — rename, pin and delete conversations; selections are remembered
- **Light and dark** — a neutral, low-chrome interface in both

## 🛠 Tech Stack

- **Next.js 15** (App Router, TypeScript, React 19)
- **Tailwind CSS v4** with shadcn/ui/Radix primitives
- **Supabase** for OAuth sign-in
- **API routes** that proxy and normalize provider responses

## 🚀 Quick Start

### 1. Install dependencies
```
npm i
```

### 2. Configure environment
Create `.env.local` with your Supabase project credentials (needed for login):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

In your Supabase project, add `http://localhost:3000/auth/callback` under
**Authentication → URL Configuration → Redirect URLs**.

### 3. Run the dev server
```
npm run dev
# Open http://localhost:3000
```

## 🔑 Environment Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Login / OAuth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (publishable) key | Login / OAuth |

> **Provider API keys are not environment variables.** PentAI is bring-your-own-key: you enter your
> [OpenRouter](https://openrouter.ai) and [Gemini](https://aistudio.google.com/app/apikey) keys in the
> app's Settings panel. They're stored in your browser's `localStorage` and sent only with your own
> requests — the server never holds a key of its own.

## 📁 Project Structure

```
app/
├── api/
│   ├── openrouter/route.ts         # Normalizes responses across OpenRouter models
│   ├── openrouter/models/route.ts  # Live OpenRouter model catalog
│   └── gemini/route.ts             # Gemini integration (Flash and Pro)
├── dashboard/page.tsx              # The multi-model compare workspace
├── auth/callback/page.tsx          # Supabase OAuth landing
└── page.tsx                        # Landing page
components/
├── dashboard/                      # Sidebar, model picker
├── home/                           # Landing page sections
├── ui/                             # shadcn primitives
└── …                               # Composer, settings, markdown renderer
context/                            # Supabase auth provider
lib/                                # Model catalog, client helpers, types
```

## ⚠️ A note on free-model rate limits

OpenRouter caps its free tier at roughly **20 requests per minute** shared across all free models,
plus a daily cap (50/day, or 1,000/day once an account has ever purchased $10 in credits). Because
every prompt calls all your selected models at once, five free models means five requests per
message — which reaches that cap quickly. Selecting fewer free models, or mixing in Gemini (which
draws on a separate key and quota), avoids it.
