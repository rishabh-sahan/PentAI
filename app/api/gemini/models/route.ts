import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';

/*
  Vercel: catalog lookups are fast; a short ceiling keeps a stalled upstream
  from holding a function open.
*/
export const maxDuration = 15;

/*
  Google retires model ids without warning — `gemini-2.5-pro` and
  `gemini-2.5-flash` both stopped accepting new keys — so the catalog is read
  live instead of hardcoded. Unlike OpenRouter and Sarvam, this endpoint needs
  the user's own key, which is why it's passed through from the browser.

  FALLBACK is only used before a key is entered, so the picker isn't empty on
  first load. Anything in it may be stale; the live list always wins.
*/
const FALLBACK = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview' },
];

/** Models that can't hold a chat: embeddings, image/video/audio generation, TTS. */
const EXCLUDE = /embedding|aqa|imagen|veo|image-generation|tts|native-audio|live-/i;

export async function GET(req: NextRequest) {
  // Closed route: these proxy paid upstreams, so an anonymous caller
  // must not be able to burn function time or enumerate catalogs.
  const { response: unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const apiKey = req.headers.get('x-gemini-key')?.trim() ?? '';

  if (!apiKey) {
    return Response.json({ models: FALLBACK, fetchedAt: Date.now(), usedFallback: true });
  }

  try {
    const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
      method: 'GET',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    });

    const payload: unknown = await resp.json().catch(() => null);

    if (!resp.ok) {
      const message =
        (payload as { error?: { message?: unknown } } | null)?.error?.message ??
        'Failed to fetch Gemini models';
      // Still return the fallback so the Google tab isn't empty on a bad key.
      return Response.json({
        models: FALLBACK,
        usedFallback: true,
        error: typeof message === 'string' ? message : 'Failed to fetch Gemini models',
      });
    }

    type Record = {
      name?: unknown;
      displayName?: unknown;
      supportedGenerationMethods?: unknown;
    };

    const records = Array.isArray((payload as { models?: unknown[] } | null)?.models)
      ? ((payload as { models?: unknown[] }).models as Record[])
      : [];

    const models = records
      .map((m) => {
        // The API returns "models/gemini-x"; the chat endpoint wants the bare id.
        const full = typeof m.name === 'string' ? m.name : '';
        const id = full.replace(/^models\//, '');
        if (!id) return null;

        const methods = Array.isArray(m.supportedGenerationMethods)
          ? (m.supportedGenerationMethods as unknown[]).map(String)
          : [];
        if (!methods.includes('generateContent')) return null;
        if (EXCLUDE.test(id)) return null;

        return {
          id,
          name: typeof m.displayName === 'string' && m.displayName ? m.displayName : id,
        };
      })
      .filter((m): m is { id: string; name: string } => Boolean(m))
      .sort((a, b) => a.name.localeCompare(b.name));

    return Response.json({
      models: models.length > 0 ? models : FALLBACK,
      usedFallback: models.length === 0,
      fetchedAt: Date.now(),
    });
  } catch (error: unknown) {
    return Response.json({
      models: FALLBACK,
      usedFallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
