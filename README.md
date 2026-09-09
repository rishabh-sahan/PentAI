<div align="center">

# PentAI

**Ask once. Compare every AI's answer side by side.**

One prompt goes to up to five AI models at the same time, and their answers land
in aligned columns — so you can see which one actually got it right instead of
opening five tabs and scrolling between them.

Built by [Rishabh Jain](https://github.com/rishabh-sahan)

</div>

---

## Contents

- [What it does](#what-it-does)
- [Providers](#providers)
- [Features](#features)
- [Quick start](#quick-start)
- [API keys](#api-keys)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Attachments](#attachments)
- [Known limits](#known-limits)
- [Tech stack](#tech-stack)

---

## What it does

Most AI tools give you one answer and leave you to decide whether to trust it.
PentAI fans a single question out to several models at once and lays the
responses beside each other, turning "is this right?" into something you can
judge at a glance.

Every model is called **in parallel**, so you wait for the slowest one — not for
all of them added together. Answers stream into their columns as they arrive.

---

## Providers

| Provider | What you get | Key required |
|----------|--------------|--------------|
| **OpenRouter** | Every free model currently on OpenRouter — dozens of them, from many labs | Yes, free |
| **Google Gemini** | Gemini chat models, and the only ones that accept image and PDF input | Yes, free tier |
| **Sarvam** | Sarvam's own models, plus the open-weight models they host | Yes |

**No model list is hardcoded.** Each provider's catalog is fetched live at
runtime, because these rosters change constantly — OpenRouter's free pool turns
over week to week, and Google retires model ids without notice. A static list
goes stale silently and leaves you selecting models that no longer answer.

---

## Features

- **Five models, one question** — asked simultaneously, answers aligned in columns
- **Live model catalogs** — always shows what each provider actually offers today
- **Provider tabs** — browse models by provider, or search across all of them
- **Bring your own keys** — stored in your browser, never on a server
- **File attachments** — documents, code, CSV, PDFs and images ([details](#attachments))
- **Persistent threads** — rename, pin and delete; selections are remembered
- **Copy anything** — one answer, or all five for a prompt at once
- **Light and dark** — a warm, low-chrome interface in both
- **Honest errors** — when a model fails, you see what the provider actually said

---

## Quick start

**Prerequisites:** Node.js 22.x

```bash
git clone https://github.com/rishabh-sahan/PentAI.git
cd PentAI
npm install
```

Copy `.env.example` to `.env.local` and fill in your Firebase project values —
the file explains where each one comes from and which are secrets.

```bash
cp .env.example .env.local
```

Then, in the [Firebase console](https://console.firebase.google.com):

1. **Authentication → Sign-in method** — enable **Google** and **GitHub**.
2. **Authentication → Settings → Authorised domains** — add `localhost`, and
   your deployed domain when you have one.
3. **Firestore Database** — create one, then deploy the rules in this repo:
   ```bash
   firebase deploy --only firestore:rules
   ```
   Without those rules Firestore denies everything (or, on test mode, allows
   far too much) — they are what stop one user reading another's chats.

```bash
npm run dev     # http://localhost:3000
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

---

## API keys

Provider keys are **not** environment variables. Open **Settings** in the app and
paste them there — each is free to create:

| Provider | Get a key |
|----------|-----------|
| OpenRouter | [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) |
| Gemini | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| Sarvam | [indus.sarvam.ai/key-management](https://indus.sarvam.ai/key-management) |

Keys live in your browser's `localStorage` and are attached only to your own
requests. **The server holds no keys of its own** — the API routes are thin
proxies that forward whatever the browser sends. Nobody else's traffic can be
billed to your account, and there is no shared quota to exhaust.

The only environment variables the app reads are the Firebase ones in `.env.example`.

---

## Project structure

```
app/
├── api/
│   ├── gemini/route.ts              # Gemini chat completions (+ image/PDF input)
│   ├── gemini/models/route.ts       # Live Gemini catalog (needs your key)
│   ├── openrouter/route.ts          # OpenRouter chat, response normalisation
│   ├── openrouter/models/route.ts   # Live OpenRouter catalog, free-tier detection
│   ├── sarvam/route.ts              # Sarvam chat, /v1 and /v2 routing
│   └── sarvam/models/route.ts       # Live Sarvam catalog
│   └── auth/session/route.ts        # Mints/clears the httpOnly session cookie
├── dashboard/page.tsx               # The comparison workspace
├── page.tsx                         # Landing page
├── layout.tsx                       # Root layout, theme + auth providers
├── globals.css                      # Design tokens, animation primitives
└── icon.svg                         # Favicon

components/
├── dashboard/
│   ├── ChatSidebar.tsx              # Threads: rename, pin, delete
│   └── ModelPicker.tsx              # Provider tabs, search, selection
├── home/                            # Landing sections + scroll reveal
├── ui/                              # shadcn primitives (button, dialog, …)
├── AIChatBox.tsx                    # Composer: autosize, drag/paste, attachments
├── MarkdownLite.tsx                 # Dependency-free markdown renderer
├── Settings.tsx                     # API key management
└── ThemeToggler.tsx

lib/
├── attachments.ts                   # File reading, classification, per-provider routing
├── client.ts                        # Browser → API route helpers
├── models.ts                        # Fallback catalog only (see the file's comment)
├── types.ts                         # Shared types
├── useLocalStorage.ts               # Cross-tab syncing storage hook
├── auth/
│   ├── constants.ts                 # Edge-safe cookie name (middleware imports this)
│   └── session.ts                   # requireUser() — server-side session verification
└── firebase/
    ├── client.ts                    # Browser SDK (auth + Firestore)
    ├── admin.ts                     # Admin SDK — the trust boundary
    └── threads.ts                   # Thread/message CRUD + live subscriptions

context/AuthContext.tsx              # Firebase session provider
middleware.ts                        # Server-side /dashboard guard
firestore.rules                      # Per-user access control
```

---

## How it works

**Sending a message.** The dashboard builds one message history, then calls every
selected model in parallel with `Promise.allSettled`. Each answer is appended as
it resolves and tagged with its model id, so one slow or failing model never
blocks the rest. The comparison grid regroups that flat list into rows of
`{ prompt, answers[] }` — which is what makes the columns line up.

**Model catalogs.** On load, all three catalogs sync at once. A failure in one
never blanks the others, and selections are only pruned after *every* catalog
has resolved — otherwise a slow fetch would wipe a valid selection mid-load.
The first run seeds a default selection from models that are live right now.

**Storage is split deliberately.**

Chats live in Firestore under `users/{uid}/threads/{threadId}`, with messages in
a `messages` subcollection rather than an array on the thread — five answers per
turn puts a long thread past Firestore's hard 1 MB per-document limit. Both are
live subscriptions, so signing in on a second device shows your history
immediately, and a reply on one device appears on the other without a refresh.

| Key | Holds | Where |
|-----|-------|-------|
| `pentai:keys` | Your provider API keys | **This browser only** |
| `pentai:active-thread` | Which thread is open | This browser only |
| `pentai:selected-models` | Current model selection | This browser only |
| `pentai:default-openrouter-seeded` | First-run default applied | This browser only |
| threads + messages | Your conversations | Firestore, per account |

**API keys are deliberately never uploaded.** Syncing them would make PentAI the
custodian of credentials that can be billed to you — so you re-enter them once
per device, and a breach of this app can never leak them.

**Security model.** `middleware.ts` blocks unauthenticated page loads before any
HTML is sent, every API route verifies a signed session cookie via the Firebase
Admin SDK, and `firestore.rules` scopes all reads and writes to
`users/{request.auth.uid}`. The middleware only checks that a cookie is present
— the Edge runtime cannot run the Admin SDK — so cryptographic verification
happens in the routes and in Firestore, which is where the data actually is.

---

## Attachments

Attach files by clicking the paperclip, dragging onto the composer, or pasting
from the clipboard. Multiple files at once are supported.

| Type | Handling | Works with |
|------|----------|------------|
| **Text, code, CSV, JSON, Markdown, logs** (~45 extensions) | Read in the browser and inlined into the prompt | **Every model**, including text-only ones |
| **PDF** | Sent as-is; Gemini reads PDFs natively | Gemini |
| **Images** | `inline_data` for Gemini, `image_url` blocks for OpenRouter | Gemini, OpenRouter vision models |

Limits: **8 MB** per file, and text is truncated at **100,000 characters** so one
large log can't consume the whole context window.

When a provider can't read an attachment, **that model's card says so** rather
than quietly answering without it. The chat transcript shows what you typed plus
the filenames, while the model receives the full inlined content — so a 50,000
character file doesn't flood the view.

---

## Known limits

**OpenRouter free-tier rate limits.** Roughly **20 requests per minute** shared
across all free models, plus a daily cap (50/day, or 1,000/day once the account
has ever purchased $10 in credits). Since every prompt calls all selected models
at once, five free models means five requests per message — which reaches that
cap quickly. Select fewer free models, or mix in Gemini and Sarvam, which draw
on separate keys and quotas.

**Sarvam's open-weight models need beta access.** `gemma4`, `glm5.2`,
`deepseekv4-flash` and similar run on Sarvam's `/v2` endpoint, which is gated
per key. Sarvam's public catalog lists them regardless, so PentAI marks them
**"Needs access"** in the picker — contact Sarvam support to have it enabled.
Sarvam's own models (`sarvam-105b`) work on any valid key.

**No streaming.** Answers appear when a model finishes rather than token by
token. With five models in parallel this keeps the grid stable, but a long
response shows a loading skeleton until it lands.

**`jose` is pinned to v5 on purpose.** `firebase-admin` pulls in `jwks-rsa`,
which is CommonJS and does a plain `require('jose')`. `jose` v6 is ESM-only, so
that require throws `ERR_REQUIRE_ESM` under Vercel's module loader — taking down
every API route in production while still working locally on Node 22.12+, which
supports `require(esm)`. The `overrides` block in `package.json` holds `jose` at
v5, which ships a CommonJS build. Removing it breaks production only.

---

## Tech stack

| | |
|---|---|
| **Framework** | Next.js 15 (App Router) · React 19 · TypeScript |
| **Styling** | Tailwind CSS v4 · shadcn/ui on Radix primitives |
| **Auth** | Firebase Authentication (Google and GitHub OAuth) |
| **Database** | Cloud Firestore — per-user chats, live-synced |
| **Animation** | CSS + IntersectionObserver — no animation library |
| **Runtime** | Node.js 22.x |

Animation is deliberately dependency-free: scroll reveals use a single
`IntersectionObserver` with CSS transitions, and all of it honours
`prefers-reduced-motion`.
