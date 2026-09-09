import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';

/*
  Vercel: chat completions are slow and the platform default depends on whether
  fluid compute is enabled on the account (300s with it, but only 10s without —
  which LLM calls routinely exceed). Declaring it explicitly makes the deploy
  behave the same either way, while still capping a hung upstream request.
  60s is within the Hobby ceiling in both configurations.
*/
export const maxDuration = 60;


export async function POST(req: NextRequest) {
  // Closed route: these proxy paid upstreams, so an anonymous caller
  // must not be able to burn function time or enumerate catalogs.
  const { response: unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    const { messages, model, apiKey: apiKeyFromBody, attachments } = await req.json();
    const apiKey = typeof apiKeyFromBody === 'string' && apiKeyFromBody.trim() ? String(apiKeyFromBody).trim() : '';
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing Gemini API key. Add your own key in Settings.' }), { status: 400 });
    /*
      No allow-list: Google retires and adds model ids continuously, and a
      hardcoded set silently rewrote every new model back to a dead default.
      The catalog comes from /api/gemini/models, so whatever the picker offers
      is already known-valid for this key. Only the shape is validated here.
    */
    const geminiModel = typeof model === 'string' && model.trim() ? model.trim() : '';
    if (!geminiModel) {
      return new Response(JSON.stringify({ error: 'Missing model id' }), { status: 400 });
    }

    // Convert OpenAI-style messages to Gemini contents
    // Gemini expects: { contents: [{ role, parts: [{ text }] }, ...] }
    type InMsg = { role?: unknown; content?: unknown };
    type GeminiPart = { text?: string; inline_data?: { mime_type: string; data: string } };
    type GeminiContent = { role: 'user' | 'model' | 'system'; parts: GeminiPart[] };

    const toRole = (r: unknown): 'user' | 'model' | 'system' => {
      const role = typeof r === 'string' ? r : '';
      if (role === 'assistant') return 'model';
      if (role === 'user' || role === 'system') return role;
      return 'user';
    };

    const contents: GeminiContent[] = (Array.isArray(messages) ? (messages as InMsg[]) : []).map((m) => ({
      role: toRole(m.role),
      parts: [{ text: typeof m?.content === 'string' ? m.content : String(m?.content ?? '') }],
    }));

    /*
      Attach binaries to the last user turn. Gemini reads both images and PDFs
      natively via inline_data, so no local extraction is needed — the file is
      passed through as base64 with its own mime type.
    */
    type InAttachment = { name?: unknown; mime?: unknown; kind?: unknown; dataUrl?: unknown };
    const binaries = (Array.isArray(attachments) ? (attachments as InAttachment[]) : []).filter(
      (a) => (a?.kind === 'image' || a?.kind === 'pdf') && typeof a?.dataUrl === 'string'
    );

    if (binaries.length > 0 && contents.length > 0) {
      for (let i = contents.length - 1; i >= 0; i--) {
        if (contents[i].role !== 'user') continue;
        for (const a of binaries) {
          try {
            const [meta, base64] = String(a.dataUrl).split(',');
            if (!base64) continue;
            const declared = typeof a.mime === 'string' ? a.mime : '';
            const mt =
              /data:(.*?);base64/.exec(meta || '')?.[1] ||
              declared ||
              (a.kind === 'pdf' ? 'application/pdf' : 'image/png');
            contents[i].parts.push({ inline_data: { mime_type: mt, data: base64 } });
          } catch {
            /* skip a file we can't decode rather than failing the whole turn */
          }
        }
        break;
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          response_mime_type: 'text/plain',
        },
      }),
    });

    const data: unknown = await resp.json();
    if (!resp.ok) {
      const errStr = (() => {
        const d = data as { error?: { message?: unknown } } | Record<string, unknown> | string | null | undefined;
        if (typeof d === 'string') return d;
        if (d && typeof d === 'object') {
          if ('error' in d && d.error && typeof (d as { error?: unknown }).error === 'object') {
            const maybe = (d as { error?: { message?: unknown } }).error;
            const m = maybe && typeof maybe === 'object' && 'message' in maybe ? (maybe as { message?: unknown }).message : undefined;
            return typeof m === 'string' ? m : JSON.stringify(m);
          }
          try { return JSON.stringify(d); } catch { return 'Unknown error'; }
        }
        return 'Unknown error';
      })();
      const errObj = errStr;
      if (resp.status === 429) {
        const text = 'Your Gemini API key hit a rate limit. Please retry after a moment or upgrade your plan/limits.';
        return Response.json({ text, error: errObj, code: 429, provider: 'gemini' });
      }
      return new Response(JSON.stringify({ error: errObj, raw: data }), { status: resp.status });
    }

    // Normalize the response to plain text, with fallbacks for empty or blocked replies
    const cand = (data as { candidates?: unknown[] } | null)?.candidates?.[0] as
      | { content?: { parts?: unknown[] }; finishReason?: unknown; safetyRatings?: Array<{ category?: unknown }> }
      | undefined;
    const rawParts = (cand?.content as { parts?: unknown[] } | undefined)?.parts;
    const parts: unknown[] = Array.isArray(rawParts) ? rawParts : [];

    let text = parts
      .map((p) => (typeof (p as { text?: unknown })?.text === 'string' ? String((p as { text?: unknown }).text) : ''))
      .filter(Boolean)
      .join('\n');

    if (!text && parts.length) {
      // No plain-text parts: surface whatever structure did come back
      text = parts
        .map((p) => {
          const pp = p as { text?: unknown; inline_data?: unknown };
          if (typeof pp?.text === 'string') return pp.text;
          if (pp?.inline_data) return '[inline data]';
          try { return JSON.stringify(p); } catch { return ''; }
        })
        .filter(Boolean)
        .join('\n');
    }

    if (!text) {
      const finish = cand?.finishReason;
      const blockReason =
        (data as { promptFeedback?: { blockReason?: unknown } } | undefined)?.promptFeedback?.blockReason ??
        cand?.safetyRatings?.[0]?.category;
      const blocked = finish && String(finish).toLowerCase().includes('safety');
      if (blocked || blockReason) {
        text = `Gemini blocked the content due to safety settings${blockReason ? ` (reason: ${blockReason})` : ''}. Try rephrasing your prompt.`;
      }
    }

    if (!text) {
      text = 'Gemini returned an empty message. Try again, rephrase, or check your API key limits in Settings.';
    }

    return Response.json({ text, raw: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

