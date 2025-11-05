import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      // Notify other hook instances in this tab
      window.dispatchEvent(new CustomEvent('local-storage', { detail: { key, value } }));
    } catch {}
  }, [key, value]);

  // Listen for updates from other tabs or other hook instances in this tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        const raw = e.newValue;
        if (typeof raw === 'string') setValue(JSON.parse(raw) as T);
      } catch {}
    };
    const onLocal = (e: Event) => {
      const anyE = e as CustomEvent<{ key: string; value: T }>;
      if (anyE?.detail?.key !== key) return;
      setValue(anyE.detail.value);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('local-storage', onLocal as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('local-storage', onLocal as EventListener);
    };
  }, [key]);

  return [value, setValue] as const;
}
