"use client";
import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { ApiKeys } from '@/lib/types';

export default function Settings() {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useLocalStorage<ApiKeys>('ai-fiesta:keys', {});
  const [gemini, setGemini] = useState(keys.gemini || '');
  const [openrouter, setOpenrouter] = useState(keys.openrouter || '');

  const save = () => {
    const next = { gemini: gemini.trim() || undefined, openrouter: openrouter.trim() || undefined };
    setKeys(next);
    setOpen(false);
  };

  // Allow programmatic open from anywhere (e.g., rate-limit CTA)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-settings', handler as EventListener);
    return () => window.removeEventListener('open-settings', handler as EventListener);
  }, []);

  return (
    <div>
      <button onClick={() => setOpen(true)} className="text-xs px-2.5 py-1 rounded border border-border bg-card hover:bg-card/80 text-foreground">Settings</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/60 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card text-foreground p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">API Keys</h2>
              <button onClick={() => setOpen(false)} className="text-sm opacity-75 hover:opacity-100">Close</button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Keys are stored locally in your browser via localStorage and sent only with your requests. Do not hardcode keys in code.</p>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm">Gemini API Key</label>
              <a
                href="https://aistudio.google.com/app/u/5/apikey?pli=1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2.5 py-1 rounded bg-primary text-primary-foreground border border-border hover:brightness-95"
              >
                Get API key
              </a>
            </div>
            <input value={gemini} onChange={(e) => setGemini(e.target.value)} placeholder="AIza..." className="w-full bg-card border border-border text-foreground placeholder:text-muted-foreground rounded px-3 py-2 mb-3" />
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm">OpenRouter API Key</label>
              <a
                href="https://openrouter.ai/sign-in?redirect_url=https%3A%2F%2Fopenrouter.ai%2Fsettings%2Fkeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2.5 py-1 rounded bg-primary text-primary-foreground border border-border hover:brightness-95"
              >
                Get API key
              </a>
            </div>
            <input value={openrouter} onChange={(e) => setOpenrouter(e.target.value)} placeholder="sk-or-..." className="w-full bg-card border border-border text-foreground placeholder:text-muted-foreground rounded px-3 py-2" />
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground border border-border hover:bg-secondary/90">Close</button>
              <button onClick={save} className="px-3 py-1.5 rounded bg-primary text-primary-foreground hover:brightness-95">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
