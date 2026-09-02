#PentAI

An open-source, multi-model AI chat playground built with Next.js App Router. Switch between providers and models, compare outputs side-by-side, and utilize optional web search and image attachments for enhanced conversations.

## ✨ Features

- **Multiple Providers**: Gemini, OpenRouter (DeepSeek R1, Llama 3.3, Qwen, Mistral, Moonshot, Reka, Sarvam, and more)
- **Selectable Model Catalog**: Choose up to 5 models to run simultaneously
- **Web Search Toggle**: Enable web search on a per-message basis
- **Image Attachment Support**: Upload and analyze images (Gemini models)
- **Clean UI**: Keyboard submit, streaming-friendly API normalization, and intuitive interface

## 🛠 Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **API Routes** for provider calls and response normalization

## 🚀 Quick Start

### 1. Install Dependencies
```
npm i
```

### 2. Configure Environment
Create `.env.local` with your Supabase project credentials (needed for login):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
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
> app's Settings panel. They are stored in your browser's `localStorage` and sent only with your own
> requests — the server never holds a key of its own.

## 📁 Project Structure

```
app/
├── api/
│   ├── openrouter/route.ts         # Normalizes responses across OpenRouter models
│   ├── openrouter/models/route.ts  # Live OpenRouter model catalog
│   └── gemini/route.ts             # Gemini API integration (Flash and Pro)
├── dashboard/page.tsx              # The multi-model compare workspace
└── page.tsx                        # Landing page
components/                         # UI components (chat box, settings, home sections)
context/                            # Supabase auth provider
lib/                                # Model catalog, client helpers, types
```

## 🧠 Notes on DeepSeek R1

PentAI post-processes DeepSeek R1 outputs to remove reasoning tags and convert Markdown to plain text for improved readability while preserving all content integrity.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
