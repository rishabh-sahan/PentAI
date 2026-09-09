export type Provider = 'gemini' | 'openrouter' | 'sarvam';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  modelId?: string; // which model produced this assistant message
  ts?: number;
};

export type AiModel = {
  id: string; // unique key in UI
  label: string; // display name
  provider: Provider;
  model: string; // provider-specific model id
  free?: boolean;
  good?: boolean; // highlight as recommended
  /**
   * Optional sub-heading within a provider's list. Sarvam serves both its own
   * models and third-party open-weight ones, and without this split the latter
   * look like they landed in the wrong provider.
   */
  group?: string;
  /** Listed by the provider but gated behind access the key may not have. */
  beta?: boolean;
  /** Shown when `beta` is set, explaining what's required. */
  betaNote?: string;
};

export type ApiKeys = {
  gemini?: string;
  openrouter?: string;
  sarvam?: string;
};

/**
 * Thread metadata without message bodies.
 *
 * The sidebar and thread list only ever need this, and messages now live in
 * their own Firestore subcollection — loading every message of every thread to
 * render a list of titles would be pointless traffic.
 */
export type ThreadSummary = {
  id: string;
  title: string;
  createdAt: number;
  pinned?: boolean;
};

export type ChatThread = ThreadSummary & {
  messages: ChatMessage[];
};
