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
    const { messages, model, apiKey: apiKeyFromBody, referer, title, attachments } = await req.json();
    const apiKey = typeof apiKeyFromBody === 'string' && apiKeyFromBody.trim() ? String(apiKeyFromBody).trim() : '';
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing OpenRouter API key. Add your own key in Settings.' }), { status: 400 });
    if (!model) return new Response(JSON.stringify({ error: 'Missing model id' }), { status: 400 });

    type InMsg = { role?: unknown; content?: unknown };
    type OutMsg = { role: 'user' | 'assistant' | 'system'; content: string };

    const isRole = (r: unknown): r is OutMsg['role'] => r === 'user' || r === 'assistant' || r === 'system';
    const sanitize = (msgs: unknown[]): OutMsg[] =>
      (Array.isArray(msgs) ? (msgs as InMsg[]) : [])
        .map((m) => {
          const role = isRole(m?.role) ? m.role : 'user';
          const content = typeof m?.content === 'string' ? m.content : String(m?.content ?? '');
          return { role, content };
        })
        .filter((m) => isRole(m.role));
    // Keep last 8 messages to avoid overly long histories for picky providers
    const trimmed = (arr: OutMsg[]) => (arr.length > 8 ? arr.slice(-8) : arr);
    /*
      Images go on the final user turn using OpenAI's vision content-block
      shape, which OpenRouter forwards to vision-capable models. Text-only
      models ignore the blocks rather than erroring, so this is safe to send
      whenever an image is attached.
    */
    type InAttachment = { kind?: unknown; dataUrl?: unknown };
    const imageUrls = (Array.isArray(attachments) ? (attachments as InAttachment[]) : [])
      .filter((a) => a?.kind === 'image' && typeof a?.dataUrl === 'string')
      .map((a) => String(a.dataUrl));

    const withImages = (msgs: OutMsg[]) => {
      if (imageUrls.length === 0) return msgs;
      const out: Array<OutMsg | { role: OutMsg['role']; content: unknown[] }> = [...msgs];
      for (let i = out.length - 1; i >= 0; i--) {
        const m = out[i] as OutMsg;
        if (m.role !== 'user') continue;
        out[i] = {
          role: 'user',
          content: [
            { type: 'text', text: m.content },
            ...imageUrls.map((url) => ({ type: 'image_url', image_url: { url } })),
          ],
        };
        break;
      }
      return out;
    };

    const makeBody = (msgs: unknown) => ({
      model,
      messages: withImages(trimmed(sanitize((msgs as unknown[]) || []))),
    });
    const requestInit = (bodyObj: unknown): RequestInit => ({
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': referer || 'http://localhost',
        'X-Title': title || 'PentAI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyObj),
    });

    // First attempt
    let resp = await fetch('https://openrouter.ai/api/v1/chat/completions', requestInit(makeBody(messages)));

    let data: unknown = await resp.json();
    if (!resp.ok) {
      const errStr = (() => {
        const d = data as { error?: { message?: unknown } } | Record<string, unknown> | string | null | undefined;
        if (typeof d === 'string') return d;
        if (d && typeof d === 'object') {
          const maybeErr = (d as { error?: { message?: unknown } }).error;
          if (maybeErr && typeof maybeErr === 'object' && 'message' in maybeErr) {
            const m = (maybeErr as { message?: unknown }).message;
            return typeof m === 'string' ? m : JSON.stringify(m);
          }
          try { return JSON.stringify(d); } catch { return 'Unknown error'; }
        }
        return 'Unknown error';
      })();
      if (resp.status === 429) {
        /*
          OpenRouter returns 429 for two different situations and the remedy is
          not the same, so don't assert one when the message says the other:
            - your key's own cap ("rate limit", "quota", "per day/minute")
            - the upstream free pool being saturated ("Provider returned error")
        */
        const isKeyLimit = /rate.?limit|quota|per (day|minute)|too many requests/i.test(errStr);
        const advice = isKeyLimit
          ? 'Free models share roughly 20 requests/minute and a daily cap across your whole key. Selecting fewer free models, or adding credit to the account, raises it.'
          : 'This usually means the free pool for this model is saturated right now rather than a problem with your key. Retrying shortly, or picking a different free model, normally works.';
        const text = `OpenRouter returned 429 for ${model}: ${errStr}\n\n${advice}`;
        return Response.json({ text, error: errStr, code: 429, provider: 'openrouter' });
      }
      if (resp.status === 404 && /model not found/i.test(errStr)) {
        const text = 'This model is currently unavailable on OpenRouter (404 model not found). It may be renamed, private, or the free pool is paused. Try again later or pick another model.';
        return Response.json({ text, code: 404, provider: 'openrouter' }, { status: 404 });
      }
      // Special-case retry for Sarvam: try with only the last user message
      if (typeof model === 'string' && /sarvam/i.test(model)) {
        const lastUser = Array.isArray(messages)
          ? [...messages].reverse().find((m) => (m as InMsg)?.role === 'user' && ((m as InMsg)?.content !== undefined))
          : null;
        if (lastUser) {
          const cont = (lastUser as InMsg).content;
          const contentVal: string = typeof cont === 'string' ? cont : String(cont);
          const simpleMsgs: OutMsg[] = [{ role: 'user', content: contentVal }];
          resp = await fetch('https://openrouter.ai/api/v1/chat/completions', requestInit(makeBody(simpleMsgs)));
          data = await resp.json();
          if (resp.ok) {
            // continue to normalization below using new data
          } else {
            const friendly2 = `OpenRouter couldn't run ${model} after a retry (HTTP ${resp.status}): ${errStr}`;
            return Response.json({ text: friendly2, error: errStr, code: resp.status, provider: 'openrouter' }, { status: resp.status });
          }
        } else {
          const friendly = `OpenRouter couldn't run ${model} (HTTP ${resp.status}): ${errStr}`;
          return Response.json({ text: friendly, error: errStr, code: resp.status, provider: 'openrouter' }, { status: resp.status });
        }
      } else {
        // Return structured JSON but also a user-friendly text to render in UI
        const friendly = `OpenRouter couldn't run ${model} (HTTP ${resp.status}): ${errStr}`;
        return Response.json({ text: friendly, error: errStr, code: resp.status, provider: 'openrouter' }, { status: resp.status });
      }
    }

    // Normalize content to a plain string
    const choice = (data as { choices?: Array<{ message?: { content?: unknown } }> } | null)?.choices?.[0] || {};
    const msg = (choice as { message?: { content?: unknown } } | null)?.message || {};
    const content: unknown = (msg as { content?: unknown } | null)?.content;
    let text = '';
    if (typeof content === 'string') {
      text = content;
    } else if (Array.isArray(content)) {
      // Array of content blocks (e.g., {type:'text', text:'...'}, {type:'reasoning', ...})
      text = content
        .map((c) => {
          if (!c) return '';
          if (typeof c === 'string') return c;
          const obj = c as { text?: unknown; content?: unknown; value?: unknown };
          if (typeof obj.text === 'string') return obj.text;
          if (typeof obj.content === 'string') return obj.content;
          if (typeof obj.value === 'string') return obj.value;
          return '';
        })
        .filter(Boolean)
        .join('\n');
    } else if (content && typeof content === 'object') {
      // Some providers nest text inside content.text
      if (typeof (content as { text?: unknown }).text === 'string') {
        text = String((content as { text?: unknown }).text);
      } else {
        try { text = JSON.stringify(content); } catch { text = ''; }
      }
    }

    // DeepSeek-style reasoning tags often include <think> ... </think>
    const stripReasoning = (s: string) =>
      s
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/<\|?thought_(start|end)\|>/gi, '')
        .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
        .trim();

    // Convert common Markdown to plain text (headers, lists, emphasis, links, code fences)
    const mdToPlain = (s: string) =>
      s
        // code fences and inline code
        .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''))
        .replace(/`([^`]+)`/g, '$1')
        // headings ###, ##, #
        .replace(/^\s{0,3}#{1,6}\s+/gm, '')
        // list markers -, *, +, numbers
        .replace(/^\s{0,3}[-*+]\s+/gm, '• ')
        .replace(/^\s{0,3}\d+\.\s+/gm, (m) => m.replace(/\d+\./, (n) => `${n.replace('.', '')}. `))
        // bold/italic
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // links [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
        // blockquotes
        .replace(/^>\s?/gm, '')
        // horizontal rules
        .replace(/^\s{0,3}([-*_])\s?\1\s?\1.*$/gm, '')
        // excess whitespace
        .replace(/\s+$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (!text) {
      // Additional fallbacks seen across some providers
      const alt = (choice as { content?: unknown }).content || (msg as { response_text?: unknown }).response_text || (msg as { result?: unknown }).result || (data as Record<string, unknown> | null | undefined)?.['output_text'];
      if (typeof alt === 'string') text = alt;
      else if (Array.isArray(alt)) {
        text = alt.map((c) => {
          if (typeof c === 'string') return c;
          const obj = c as { text?: unknown; content?: unknown };
          if (typeof obj.text === 'string') return obj.text;
          if (typeof obj.content === 'string') return obj.content;
          return '';
        }).filter(Boolean).join('\n');
      }
    }

    if (text) {
      const stripped = stripReasoning(text);
      text = stripped || text; // avoid stripping to empty
      // For DeepSeek R1, return plain text (no Markdown) to improve readability
      if (typeof model === 'string' && /deepseek\s*\/\s*deepseek-r1/i.test(model)) {
        text = mdToPlain(text);
      }
    }

    if (!text) {
      text = 'No response from provider.';
    }

    return Response.json({ text, raw: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

