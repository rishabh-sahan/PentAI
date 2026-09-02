import { ChatMessage } from './types';
import type { Attachment } from './attachments';

export type OpenRouterLiveModel = {
  id: string;
  name: string;
  isFree: boolean;
};

export type GeminiLiveModel = {
  id: string;
  name: string;
};

export type SarvamLiveModel = {
  id: string;
  name: string;
  ownedBy: string;
  /** Sarvam's /v2 open-weight endpoint needs beta access granted per key. */
  beta?: boolean;
};

export async function callGemini(args: {
  apiKey?: string;
  model: string;
  messages: ChatMessage[];
  attachments?: Attachment[];
}) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  return res.json();
}

export async function callOpenRouter(args: {
  apiKey?: string;
  model: string;
  messages: ChatMessage[];
  attachments?: Attachment[];
}) {
  const res = await fetch('/api/openrouter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...args,
      referer: typeof window !== 'undefined' ? window.location.origin : undefined,
      title: 'PentAI',
    }),
  });
  return res.json();
}

export async function callSarvam(args: {
  apiKey?: string;
  model: string;
  messages: ChatMessage[];
}) {
  const res = await fetch('/api/sarvam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  return res.json();
}

export async function fetchOpenRouterLiveModels(args?: {
  apiKey?: string;
}): Promise<{ models: OpenRouterLiveModel[]; fetchedAt?: number; error?: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (args?.apiKey?.trim()) headers['x-openrouter-key'] = args.apiKey.trim();

  const res = await fetch('/api/openrouter/models', { method: 'GET', headers });
  return res.json();
}

export async function fetchGeminiLiveModels(args?: {
  apiKey?: string;
}): Promise<{ models: GeminiLiveModel[]; usedFallback?: boolean; error?: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (args?.apiKey?.trim()) headers['x-gemini-key'] = args.apiKey.trim();

  const res = await fetch('/api/gemini/models', { method: 'GET', headers });
  return res.json();
}

export async function fetchSarvamLiveModels(): Promise<{
  models: SarvamLiveModel[];
  fetchedAt?: number;
  error?: string;
}> {
  const res = await fetch('/api/sarvam/models', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}
