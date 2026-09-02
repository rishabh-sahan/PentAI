/*
  Attachment handling.

  Three kinds, because providers accept them differently:
    text  — extracted in the browser and inlined into the prompt. Works with
            EVERY model, including text-only ones.
    image — sent as binary to providers with vision (Gemini inline_data,
            OpenRouter image_url blocks).
    pdf   — sent as binary to Gemini, which reads PDFs natively. Other
            providers can't, and we say so rather than silently dropping it.

  Nothing here needs a parsing library: text formats are read directly, and
  PDFs are handed to Gemini as-is instead of being extracted locally.
*/

export type AttachmentKind = 'text' | 'image' | 'pdf' | 'unsupported';

export type Attachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
  kind: AttachmentKind;
  /** Populated for `text` — the file's contents. */
  text?: string;
  /** Populated for `image` and `pdf` — a base64 data URL. */
  dataUrl?: string;
  /** Set when the file could not be used, explaining why. */
  problem?: string;
};

/** Anything larger is refused: providers reject huge payloads anyway. */
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

/** Guards against one enormous log file eating the whole context window. */
export const MAX_TEXT_CHARS = 100_000;

const TEXT_EXTENSIONS = [
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'jsonl', 'yaml', 'yml', 'xml',
  'html', 'htm', 'css', 'scss', 'js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'go',
  'rs', 'java', 'kt', 'c', 'h', 'cpp', 'hpp', 'cs', 'php', 'sh', 'bash', 'zsh',
  'sql', 'toml', 'ini', 'cfg', 'conf', 'env', 'log', 'srt', 'vtt', 'rst', 'tex',
];

/** File types the picker advertises. */
export const ACCEPT_ATTR = [
  'image/*',
  'application/pdf',
  'text/*',
  '.md,.markdown,.csv,.tsv,.json,.jsonl,.yaml,.yml,.xml,.log,.sql,.toml,.ini,.cfg,.conf',
  '.js,.jsx,.ts,.tsx,.py,.rb,.go,.rs,.java,.kt,.c,.h,.cpp,.hpp,.cs,.php,.sh',
].join(',');

const extensionOf = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

export function classify(file: File): AttachmentKind {
  const mime = file.type.toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf' || extensionOf(file.name) === 'pdf') return 'pdf';
  if (mime.startsWith('text/')) return 'text';
  if (TEXT_EXTENSIONS.includes(extensionOf(file.name))) return 'text';
  // Some browsers report an empty type for unusual extensions.
  if (!mime && TEXT_EXTENSIONS.includes(extensionOf(file.name))) return 'text';
  return 'unsupported';
}

const readAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsText(file);
  });

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

export async function toAttachment(file: File): Promise<Attachment> {
  const base = {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    mime: file.type || 'application/octet-stream',
    size: file.size,
  };

  if (file.size > MAX_FILE_BYTES) {
    return {
      ...base,
      kind: 'unsupported',
      problem: `Too large (${formatBytes(file.size)}). The limit is ${formatBytes(MAX_FILE_BYTES)}.`,
    };
  }

  const kind = classify(file);

  try {
    if (kind === 'text') {
      const raw = await readAsText(file);
      const truncated = raw.length > MAX_TEXT_CHARS;
      return {
        ...base,
        kind,
        text: truncated ? `${raw.slice(0, MAX_TEXT_CHARS)}\n\n[truncated]` : raw,
        problem: truncated ? 'Only the first 100,000 characters were included.' : undefined,
      };
    }

    if (kind === 'image' || kind === 'pdf') {
      return { ...base, kind, dataUrl: await readAsDataUrl(file) };
    }

    return {
      ...base,
      kind: 'unsupported',
      problem: 'Unsupported file type. Try a text, code, PDF or image file.',
    };
  } catch (err) {
    return {
      ...base,
      kind: 'unsupported',
      problem: err instanceof Error ? err.message : 'Could not read this file.',
    };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Folds text attachments into the prompt so every model sees them, regardless
 * of whether it supports file input.
 */
export function buildPromptWithText(prompt: string, attachments: Attachment[]): string {
  const textFiles = attachments.filter((a) => a.kind === 'text' && a.text);
  if (textFiles.length === 0) return prompt;

  const blocks = textFiles
    .map((a) => `--- File: ${a.name} ---\n${a.text}\n--- End of ${a.name} ---`)
    .join('\n\n');

  return `${blocks}\n\n${prompt}`;
}

/**
 * Which binary attachments a given provider can actually accept. Anything not
 * returned here is reported to the user instead of being silently dropped.
 */
export function binaryFor(provider: 'gemini' | 'openrouter' | 'sarvam', attachments: Attachment[]) {
  const images = attachments.filter((a) => a.kind === 'image' && a.dataUrl);
  const pdfs = attachments.filter((a) => a.kind === 'pdf' && a.dataUrl);

  if (provider === 'gemini') return { images, pdfs, unsupported: [] as Attachment[] };
  // OpenRouter passes images through to vision-capable models; no PDF support.
  if (provider === 'openrouter') return { images, pdfs: [], unsupported: pdfs };
  // Sarvam's chat endpoints take text only.
  return { images: [], pdfs: [], unsupported: [...images, ...pdfs] };
}
