import { ChatMessage } from './types';

export type OpenRouterLiveModel = {
  id: string;
  name: string;
  isFree: boolean;
};

export async function callGemini(args: { apiKey?: string; model: string; messages: ChatMessage[]; imageDataUrl?: string }) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  return res.json();
}

export async function callOpenRouter(args: { apiKey?: string; model: string; messages: ChatMessage[] }) {
  const res = await fetch('/api/openrouter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...args, referer: typeof window !== 'undefined' ? window.location.origin : undefined, title: 'PentAI' }),
  });
  return res.json();
}

export async function fetchOpenRouterLiveModels(args?: { apiKey?: string }): Promise<{ models: OpenRouterLiveModel[]; fetchedAt?: number; error?: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (args?.apiKey?.trim()) {
    headers['x-openrouter-key'] = args.apiKey.trim();
  }

  const res = await fetch('/api/openrouter/models', {
    method: 'GET',
    headers,
  });

  return res.json();
}
