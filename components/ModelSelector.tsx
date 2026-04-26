"use client";
import { useMemo } from 'react';
import { MODEL_CATALOG } from '@/lib/models';
import { AiModel } from '@/lib/types';

export default function ModelSelector({
  selectedIds,
  onToggle,
  max = 5,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  max?: number;
}) {
  const disabledIds = useMemo(() => {
    if (selectedIds.length < max) return new Set<string>();
    return new Set<string>(MODEL_CATALOG.filter(m => !selectedIds.includes(m.id)).map(m => m.id));
  }, [selectedIds, max]);

  return (
    <div className="flex flex-wrap gap-2">
      {MODEL_CATALOG.map((m: AiModel) => {
        const selected = selectedIds.includes(m.id);
        const disabled = disabledIds.has(m.id);
        return (
          <button
            key={m.id}
            onClick={() => onToggle(m.id)}
            disabled={!selected && disabled}
            className={`px-3 py-1.5 rounded-md border text-sm tracking-tight transition-colors ${selected ? 'bg-primary border-primary/40 text-primary-foreground shadow-sm' : 'bg-card border-border text-foreground'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-accent'}`}
            title={disabled ? `Max ${max} models at once` : ''}
          >
            {selected ? '✓ ' : ''}{m.label}
          </button>
        );
      })}
    </div>
  );
}
