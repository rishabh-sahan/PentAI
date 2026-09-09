"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, RefreshCw, Search } from "lucide-react"

import { AiModel, Provider } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export const MAX_SELECTED = 5

type TabKey = "all" | Provider

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "openrouter", label: "OpenRouter" },
  { key: "gemini", label: "Google" },
  { key: "sarvam", label: "Sarvam" },
]

const PROVIDER_BLURB: Record<Provider, string> = {
  openrouter: "Free models from many labs, through one OpenRouter key.",
  gemini: "Google's Gemini models. The only ones that accept image input.",
  sarvam: "Sarvam's own models plus the open-weight models they host.",
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalog: AiModel[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onClear: () => void
  onRefresh: () => void
  syncing: boolean
  syncError: string | null
  missingKeys: Provider[]
  onOpenSettings: () => void
}

export function ModelPicker({
  open,
  onOpenChange,
  catalog,
  selectedIds,
  onToggle,
  onClear,
  onRefresh,
  syncing,
  syncError,
  missingKeys,
  onOpenSettings,
}: Props) {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<TabKey>("all")

  // A stale query from a previous visit makes the list look broken on reopen.
  useEffect(() => {
    if (open) setQuery("")
  }, [open])

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: catalog.length, openrouter: 0, gemini: 0, sarvam: 0 }
    for (const m of catalog) c[m.provider] += 1
    return c
  }, [catalog])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter((m) => {
      if (tab !== "all" && m.provider !== tab) return false
      if (!q) return true
      return m.label.toLowerCase().includes(q) || m.model.toLowerCase().includes(q)
    })
  }, [catalog, tab, query])

  /*
    Two levels of grouping: by provider on the "All" tab, then by model.group
    within a provider. The second level is what keeps Sarvam's hosted
    open-weight models from looking misfiled under the Sarvam heading.
  */
  const groups = useMemo(() => {
    const byProvider =
      tab !== "all"
        ? [{ key: tab as Provider, items: visible }]
        : (["openrouter", "gemini", "sarvam"] as Provider[])
            .map((p) => ({ key: p, items: visible.filter((m) => m.provider === p) }))
            .filter((g) => g.items.length > 0)

    return byProvider.map((group) => {
      const seen: string[] = []
      for (const m of group.items) {
        const g = m.group ?? ""
        if (!seen.includes(g)) seen.push(g)
      }
      // Only worth sub-splitting when the provider actually uses named groups.
      const subgroups =
        seen.length > 1 || (seen.length === 1 && seen[0] !== "")
          ? seen.map((name) => ({
              name,
              items: group.items.filter((m) => (m.group ?? "") === name),
            }))
          : null
      return { ...group, subgroups }
    })
  }, [tab, visible])

  // A missing Google key is irrelevant while you're looking at the Sarvam tab.
  const relevantMissingKeys = useMemo(
    () => (tab === "all" ? missingKeys : missingKeys.filter((p) => p === tab)),
    [missingKeys, tab]
  )

  const atLimit = selectedIds.length >= MAX_SELECTED

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
          <DialogTitle>Select models</DialogTitle>
          <DialogDescription>
            Compare up to {MAX_SELECTED} at once —{" "}
            <span className="font-medium text-foreground">{selectedIds.length} selected</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Provider tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-4 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 rounded-t-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {counts[t.key]}
                </span>
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>

        {/* Search + actions */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search models…"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/25 sm:text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={onRefresh} disabled={syncing}>
            <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={onClear}
            disabled={selectedIds.length === 0}
          >
            Clear
          </Button>
        </div>

        <div className="max-h-[46dvh] overflow-y-auto px-4 py-4 sm:px-6">
          {tab !== "all" && (
            <p className="mb-3 text-xs text-muted-foreground">{PROVIDER_BLURB[tab as Provider]}</p>
          )}

          {syncError && (
            <p className="mb-4 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
              Live sync failed ({syncError}). Showing what&apos;s cached.
            </p>
          )}

          {relevantMissingKeys.length > 0 && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5">
              {/* text-foreground rather than the gold pair: guaranteed readable in both themes */}
              <p className="text-xs leading-relaxed text-foreground">
                No API key yet for {relevantMissingKeys.map(providerName).join(" or ")}. You can
                still select {tab === "all" ? "those" : "these"} models — they just can&apos;t
                answer until a key is added.
              </p>
              <Button size="sm" variant="outline" className="h-7 shrink-0" onClick={onOpenSettings}>
                Add key
              </Button>
            </div>
          )}

          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {query ? <>No models match “{query}”.</> : <>Nothing here yet.</>}
            </p>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.key}>
                  {tab === "all" && (
                    <div className="mb-2 flex items-baseline justify-between">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {providerName(group.key)}
                      </h3>
                      <span className="text-xs text-muted-foreground">{group.items.length}</span>
                    </div>
                  )}
                  {group.subgroups ? (
                    <div className="space-y-4">
                      {group.subgroups.map((sub) => (
                        <div key={sub.name || "ungrouped"}>
                          {sub.name && (
                            <div className="mb-1.5">
                              <p className="text-[11px] text-muted-foreground">{sub.name}</p>
                              {sub.items.some((m) => m.beta) && (
                                <p className="mt-0.5 text-[11px] text-destructive">
                                  {sub.items.find((m) => m.betaNote)?.betaNote}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="space-y-1">
                            {sub.items.map((model) => (
                              <ModelRow
                                key={model.id}
                                model={model}
                                selected={selectedIds.includes(model.id)}
                                atLimit={atLimit}
                                onToggle={onToggle}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {group.items.map((model) => (
                        <ModelRow
                          key={model.id}
                          model={model}
                          selected={selectedIds.includes(model.id)}
                          atLimit={atLimit}
                          onToggle={onToggle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function providerName(p: Provider) {
  if (p === "openrouter") return "OpenRouter"
  if (p === "gemini") return "Google"
  return "Sarvam"
}

function ModelRow({
  model,
  selected,
  atLimit,
  onToggle,
}: {
  model: AiModel
  selected: boolean
  atLimit: boolean
  onToggle: (id: string) => void
}) {
  const disabled = !selected && atLimit

  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(model.id)}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-primary/40 bg-primary/8"
          : disabled
            ? "cursor-not-allowed border-transparent opacity-40"
            : "border-transparent hover:bg-accent"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          selected ? "border-primary bg-primary" : "border-border"
        )}
      >
        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm text-foreground">{model.label}</span>
          {model.free && (
            <span className="shrink-0 rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-medium text-gold-foreground">
              Free
            </span>
          )}
          {model.beta && (
            <span className="shrink-0 rounded-full border border-destructive/40 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
              Needs access
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
          {model.model}
        </span>
      </span>
    </button>
  )
}
