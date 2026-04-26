import { NextRequest } from 'next/server';

type OpenRouterModelRecord = {
  id?: unknown;
  name?: unknown;
  pricing?: {
    prompt?: unknown;
    completion?: unknown;
  };
};

const parsePrice = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const isLikelyFree = (id: string, pricing: OpenRouterModelRecord['pricing']): boolean => {
  if (/:free$/i.test(id)) return true;
  const prompt = parsePrice(pricing?.prompt);
  const completion = parsePrice(pricing?.completion);
  return prompt === 0 && completion === 0;
};

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-openrouter-key')?.trim() ?? '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers,
      next: { revalidate: 120 },
    });

    const payload: unknown = await response.json();
    if (!response.ok) {
      const errorMessage =
        typeof payload === 'object' && payload && 'error' in (payload as Record<string, unknown>)
          ? JSON.stringify((payload as Record<string, unknown>).error)
          : 'Failed to fetch OpenRouter models';
      return Response.json({ error: errorMessage }, { status: response.status });
    }

    const records = Array.isArray((payload as { data?: unknown[] } | null)?.data)
      ? ((payload as { data?: unknown[] }).data as OpenRouterModelRecord[])
      : [];

    const models = records
      .map((item) => {
        const id = typeof item.id === 'string' ? item.id : '';
        if (!id) return null;
        const name = typeof item.name === 'string' ? item.name : id;
        return {
          id,
          name,
          isFree: isLikelyFree(id, item.pricing),
        };
      })
      .filter((item): item is { id: string; name: string; isFree: boolean } => Boolean(item))
      .sort((a, b) => a.id.localeCompare(b.id));

    return Response.json({ models, fetchedAt: Date.now() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
