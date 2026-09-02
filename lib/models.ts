import { AiModel } from './types';

/*
  Fallback only.

  Every provider's catalog is fetched live at runtime — OpenRouter and Sarvam
  from public endpoints, Gemini from Google's using the user's own key. This
  list exists solely so the Google tab isn't empty before a key is entered.

  Do not treat these ids as authoritative: Google retires them without warning
  (gemini-2.5-pro and -2.5-flash both stopped accepting new keys), which is
  exactly why nothing here is used once the live sync returns.
*/
export const MODEL_CATALOG: AiModel[] = [
  {
    id: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash',
    provider: 'gemini',
    model: 'gemini-3.6-flash',
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro Preview',
    provider: 'gemini',
    model: 'gemini-3.1-pro-preview',
    good: true,
  },
];

export function isOpenRouterFreeModel(model: AiModel): boolean {
  if (model.provider !== 'openrouter') return false;
  return model.free === true || /:free$/i.test(model.model);
}

export function isOpenRouterPaidModel(model: AiModel): boolean {
  return model.provider === 'openrouter' && !isOpenRouterFreeModel(model);
}

export function isModelFree(model: AiModel): boolean {
  if (model.provider === 'openrouter') return isOpenRouterFreeModel(model);
  return model.free === true;
}
