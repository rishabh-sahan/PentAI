import { AiModel } from './types';

// Gemini models are hardcoded since they don't come from OpenRouter's catalog.
// OpenRouter models are NOT hardcoded here — their free-model roster turns over
// too fast for a static list to stay accurate. The dashboard fetches the live
// OpenRouter catalog at runtime (see fetchOpenRouterLiveModels in lib/client.ts)
// and builds the selectable OpenRouter list from that instead.
export const MODEL_CATALOG: AiModel[] = [
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    good: true,
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
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
