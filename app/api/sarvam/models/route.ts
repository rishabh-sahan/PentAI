import { requireUser } from '@/lib/auth/session';
/*
  Vercel: catalog lookups are fast and cached; a short ceiling is plenty and
  keeps a stalled upstream from holding a function open.
*/
export const maxDuration = 15;



/*
  Sarvam's /v2/models discovery endpoint is unauthenticated, so the catalog can
  be synced without the user having entered a key yet.

  It lists only /v2 models, so sarvam-105b-conversations (a /v1-only model) is
  added manually — otherwise it would never appear in the picker.
*/
const V1_ONLY_MODELS = [
  { id: 'sarvam-105b-conversations', label: 'Sarvam 105B Conversations' },
];

const LABELS: Record<string, string> = {
  'sarvam-105b': 'Sarvam 105B',
  'glm5.2': 'GLM 5.2',
  gemma4: 'Gemma 4',
  'deepseekv4-flash': 'DeepSeek V4 Flash',
};

/*
  Periods are part of version numbers here (glm5.2, glm5.3-flash), so splitting
  on them turns "glm5.3" into "Glm5 3". Only - and _ are word separators.
*/
const titleCase = (id: string) =>
  id
    .replace(/[-_]+/g, ' ')
    .replace(/(^|\s)(\w)/g, (_, lead, ch: string) => lead + ch.toUpperCase())
    .replace(/\bGlm(\d)/gi, 'GLM $1')
    .replace(/\bDeepseek/gi, 'DeepSeek')
    .trim();

export async function GET() {
  // Closed route: these proxy paid upstreams, so an anonymous caller
  // must not be able to burn function time or enumerate catalogs.
  const { response: unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  try {
    const resp = await fetch('https://api.sarvam.ai/v2/models', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    });

    const payload: unknown = await resp.json().catch(() => null);

    if (!resp.ok) {
      return Response.json(
        { error: 'Failed to fetch Sarvam models' },
        { status: resp.status }
      );
    }

    const records = Array.isArray((payload as { data?: unknown[] } | null)?.data)
      ? ((payload as { data?: unknown[] }).data as Array<{ id?: unknown; owned_by?: unknown }>)
      : [];

    /*
      This endpoint is unauthenticated, so it lists the open-weight /v2 models
      for everyone — including keys without beta access, which get
      "This endpoint is currently in beta and not available" on the first call.
      Flagging them here lets the picker warn before a model is selected
      rather than after five identical failures.
    */
    const live = records
      .map((item) => {
        const id = typeof item.id === 'string' ? item.id : '';
        if (!id) return null;
        const ownedBy = typeof item.owned_by === 'string' ? item.owned_by : 'sarvam';
        return {
          id,
          name: LABELS[id] ?? titleCase(id),
          ownedBy,
          beta: ownedBy !== 'sarvam',
        };
      })
      .filter((m): m is { id: string; name: string; ownedBy: string; beta: boolean } => Boolean(m));

    const seen = new Set(live.map((m) => m.id));
    const extras = V1_ONLY_MODELS.filter((m) => !seen.has(m.id)).map((m) => ({
      id: m.id,
      name: m.label,
      ownedBy: 'sarvam',
      beta: false,
    }));

    const models = [...live, ...extras].sort((a, b) => a.name.localeCompare(b.name));

    return Response.json({ models, fetchedAt: Date.now() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
