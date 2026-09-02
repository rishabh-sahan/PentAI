"use client"

import { useEffect, useState } from "react"

/*
  The free-model count is fetched live from the same public endpoint the
  dashboard uses, so the number on the marketing page can't drift from reality.
  Falls back to a static label if the request fails — never shows a wrong count.
*/
const STATS = [
  { value: "5", label: "models per question", hint: "Asked in parallel, not one after another" },
  { value: "3", label: "providers supported", hint: "OpenRouter, Google Gemini and Sarvam" },
  { value: "₹0", label: "to get started", hint: "Free models and free API keys" },
]

export function StatsSection() {
  const [freeCount, setFreeCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/openrouter/models")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !Array.isArray(d?.models)) return
        setFreeCount(d.models.filter((m: { isFree?: boolean }) => m.isFree).length)
      })
      .catch(() => {
        /* leave the fallback label in place */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const items = [
    {
      value: freeCount === null ? "Live" : String(freeCount),
      label: "free models right now",
      hint: "Synced from OpenRouter every time you open the app",
    },
    ...STATS,
  ]

  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.label}
              data-reveal
              data-reveal-delay={i * 70}
              className="bg-card p-6 text-center"
            >
              <div className="text-3xl font-semibold tracking-tight text-primary md:text-4xl">
                {item.value}
              </div>
              <div className="mt-1.5 text-sm font-medium text-foreground">{item.label}</div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
