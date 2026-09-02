import { NextRequest } from 'next/server';

/*
  Vercel: chat completions are slow and the platform default depends on whether
  fluid compute is enabled on the account (300s with it, but only 10s without —
  which LLM calls routinely exceed). Declaring it explicitly makes the deploy
  behave the same either way, while still capping a hung upstream request.
  60s is within the Hobby ceiling in both configurations.
*/
export const maxDuration = 60;


/*
  Sarvam AI chat completions.

  Two endpoints exist and they are not interchangeable:
    /v1/chat/completions — Sarvam's own models (sarvam-105b, -conversations)
    /v2/chat/completions — open-weight models (glm5.2, gemma4, deepseekv4-flash)
  Auth is a single `api-subscription-key` header, not a bearer token.
*/
const isSarvamOwnModel = (model: string) => /^sarvam-/i.test(model.trim());

const endpointFor = (model: string) =>
  isSarvamOwnModel(model)
    ? 'https://api.sarvam.ai/v1/chat/completions'
    : 'https://api.sarvam.ai/v2/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey: apiKeyFromBody } = await req.json();
    const apiKey =
      typeof apiKeyFromBody === 'string' && apiKeyFromBody.trim() ? apiKeyFromBody.trim() : '';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Sarvam API key. Add your own key in Settings.' }),
        { status: 400 }
      );
    }
    if (!model || typeof model !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing model id' }), { status: 400 });
    }

    type InMsg = { role?: unknown; content?: unknown };
    type OutMsg = { role: 'user' | 'assistant' | 'system'; content: string };

    const isRole = (r: unknown): r is OutMsg['role'] =>
      r === 'user' || r === 'assistant' || r === 'system';

    const sanitized: OutMsg[] = (Array.isArray(messages) ? (messages as InMsg[]) : []).map((m) => ({
      role: isRole(m?.role) ? m.role : 'user',
      content: typeof m?.content === 'string' ? m.content : String(m?.content ?? ''),
    }));

    // Keep the tail of the conversation; long histories are rejected by some models.
    const trimmed = sanitized.length > 8 ? sanitized.slice(-8) : sanitized;

    const resp = await fetch(endpointFor(model), {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      // max_tokens is optional per the docs but appears in every /v2 example;
      // the open-weight models are beta and stricter than the /v1 ones.
      body: JSON.stringify({ model, messages: trimmed, max_tokens: 2048 }),
    });

    const data: unknown = await resp.json().catch(() => null);

    if (!resp.ok) {
      const errStr = (() => {
        const d = data as Record<string, unknown> | string | null;
        if (typeof d === 'string') return d;
        if (d && typeof d === 'object') {
          const err = (d as { error?: unknown }).error;
          if (typeof err === 'string') return err;
          if (err && typeof err === 'object') {
            const msg = (err as { message?: unknown }).message;
            if (typeof msg === 'string') return msg;
          }
          try {
            return JSON.stringify(d);
          } catch {
            return 'Unknown error';
          }
        }
        return 'Unknown error';
      })();

      if (resp.status === 401 || resp.status === 403) {
        return Response.json(
          {
            text: 'Sarvam rejected your API key. Check it in Settings — it should start with "sk_".',
            error: errStr,
            code: resp.status,
            provider: 'sarvam',
          },
          { status: resp.status }
        );
      }
      if (resp.status === 429) {
        return Response.json({
          text: 'Your Sarvam API key hit a rate limit. Please retry in a moment.',
          error: errStr,
          code: 429,
          provider: 'sarvam',
        });
      }
      // Surface what the provider actually said. A generic "[status 400]" makes
      // the difference between "bad request" and "your plan lacks this model"
      // impossible to tell apart from the UI.
      return Response.json(
        {
          text: `Sarvam couldn't run ${model} (HTTP ${resp.status}): ${errStr}`,
          error: errStr,
          code: resp.status,
          provider: 'sarvam',
        },
        { status: resp.status }
      );
    }

    // Normalize the OpenAI-shaped response to plain text.
    const choice = (data as { choices?: Array<{ message?: { content?: unknown } }> } | null)
      ?.choices?.[0];
    const content: unknown = choice?.message?.content;

    let text = '';
    if (typeof content === 'string') {
      text = content;
    } else if (Array.isArray(content)) {
      text = content
        .map((c) => {
          if (typeof c === 'string') return c;
          const obj = c as { text?: unknown; content?: unknown };
          if (typeof obj?.text === 'string') return obj.text;
          if (typeof obj?.content === 'string') return obj.content;
          return '';
        })
        .filter(Boolean)
        .join('\n');
    }

    // Reasoning models can wrap their scratchpad in think tags.
    text = text
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
      .trim();

    if (!text) text = 'No response from Sarvam.';

    return Response.json({ text, raw: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
