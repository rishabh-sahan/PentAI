"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"

import { useLocalStorage } from "@/lib/useLocalStorage"
import { ApiKeys } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const KEY_FIELDS = [
  {
    id: "openrouter" as const,
    label: "OpenRouter",
    placeholder: "sk-or-…",
    help: "One key unlocks every free and paid OpenRouter model.",
    href: "https://openrouter.ai/settings/keys",
  },
  {
    id: "gemini" as const,
    label: "Gemini",
    placeholder: "AIza…",
    help: "Required for Gemini models and image input.",
    href: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "sarvam" as const,
    label: "Sarvam",
    placeholder: "sk_…",
    help: "Sarvam's own models plus the open-weight models they host.",
    href: "https://indus.sarvam.ai/key-management",
  },
]

export default function Settings({ trigger = true }: { trigger?: boolean }) {
  const [open, setOpen] = useState(false)
  const [keys, setKeys] = useLocalStorage<ApiKeys>("pentai:keys", {})
  const [draft, setDraft] = useState<ApiKeys>(keys)

  // Re-sync the draft whenever the dialog opens, so it never shows stale input.
  useEffect(() => {
    if (open) setDraft(keys)
  }, [open, keys])

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-settings", handler)
    return () => window.removeEventListener("open-settings", handler)
  }, [])

  const save = () => {
    setKeys({
      gemini: draft.gemini?.trim() || undefined,
      openrouter: draft.openrouter?.trim() || undefined,
      sarvam: draft.sarvam?.trim() || undefined,
    })
    setOpen(false)
  }

  return (
    <>
      {trigger && (
        <Button variant="outline" size="sm" className="h-8" onClick={() => setOpen(true)}>
          Settings
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API keys</DialogTitle>
            <DialogDescription>
              Stored in this browser only and sent with your own requests. Both are free to create.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {KEY_FIELDS.map((field) => (
              <div key={field.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor={field.id} className="text-sm font-medium text-foreground">
                    {field.label}
                  </label>
                  <a
                    href={field.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Get a key
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <input
                  id={field.id}
                  type="password"
                  value={draft[field.id] ?? ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring/30"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">{field.help}</p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save keys</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
