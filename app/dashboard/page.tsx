"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Copy, Loader2, PanelLeft, Plus, SlidersHorizontal, X } from "lucide-react"

import Settings from "@/components/Settings"
import MarkdownLite from "@/components/MarkdownLite"
import ThemeToggler from "@/components/ThemeToggler"
import { AiInput } from "@/components/AIChatBox"
import { ChatSidebar } from "@/components/dashboard/ChatSidebar"
import { MAX_SELECTED, ModelPicker } from "@/components/dashboard/ModelPicker"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/lib/useLocalStorage"
import { MODEL_CATALOG } from "@/lib/models"
import { AiModel, ApiKeys, ChatMessage, ChatThread, Provider } from "@/lib/types"
import {
  callGemini,
  callOpenRouter,
  callSarvam,
  fetchOpenRouterLiveModels,
  fetchSarvamLiveModels,
  type OpenRouterLiveModel,
  type SarvamLiveModel,
} from "@/lib/client"
import { binaryFor, buildPromptWithText, type Attachment } from "@/lib/attachments"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

const normalizeModelId = (id: string) => id.trim().toLowerCase()

const makeUiId = (prefix: string, id: string) =>
  `${prefix}-${normalizeModelId(id)}`
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

const PROVIDER_LABEL: Record<Provider, string> = {
  openrouter: "OpenRouter",
  gemini: "Gemini",
  sarvam: "Sarvam",
}

export default function DashboardPage() {
  const { session, loading } = useAuth()
  const router = useRouter()

  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>("pentai:selected-models", [
    "gemini-2.5-flash",
  ])
  const [defaultSeeded, setDefaultSeeded] = useLocalStorage<boolean>(
    "pentai:default-openrouter-seeded",
    false
  )
  const [keys] = useLocalStorage<ApiKeys>("pentai:keys", {})
  const [threads, setThreads] = useLocalStorage<ChatThread[]>("pentai:threads", [])
  const [activeId, setActiveId] = useLocalStorage<string | null>("pentai:active-thread", null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const [liveModels, setLiveModels] = useState<OpenRouterLiveModel[] | null>(null)
  const [sarvamModels, setSarvamModels] = useState<SarvamLiveModel[] | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId]
  )
  const messages = useMemo(() => activeThread?.messages ?? [], [activeThread])

  /* ---------------------------------------------------------------- catalog */

  const liveFreeCatalog = useMemo<AiModel[]>(() => {
    if (!liveModels) return []
    return liveModels
      .filter((m) => m.isFree && normalizeModelId(m.id) !== "openrouter/free")
      .map((m) => ({
        id: makeUiId("openrouter-live", m.id),
        label: m.name.replace(/\s*\(free\)\s*$/i, ""),
        provider: "openrouter" as const,
        model: m.id,
        free: true,
      }))
  }, [liveModels])

  const sarvamCatalog = useMemo<AiModel[]>(() => {
    if (!sarvamModels) return []
    // Sarvam's own models are the reason to hold a Sarvam key, so they lead.
    const ordered = [...sarvamModels].sort((a, b) => {
      const aOwn = a.ownedBy === "sarvam" ? 0 : 1
      const bOwn = b.ownedBy === "sarvam" ? 0 : 1
      return aOwn - bOwn || a.name.localeCompare(b.name)
    })
    return ordered.map((m) => {
      const isOwn = m.ownedBy === "sarvam"
      return {
        id: makeUiId("sarvam", m.id),
        label: m.name,
        provider: "sarvam" as const,
        model: m.id,
        good: isOwn,
        group: isOwn ? "Sarvam's own models" : "Open-weight models hosted by Sarvam",
        beta: Boolean(m.beta),
        betaNote: m.beta
          ? "Sarvam's open-weight endpoint is in beta — your key needs access granted before this model can answer."
          : undefined,
      }
    })
  }, [sarvamModels])

  const catalog = useMemo<AiModel[]>(
    () => [...liveFreeCatalog, ...MODEL_CATALOG, ...sarvamCatalog],
    [liveFreeCatalog, sarvamCatalog]
  )

  const freeModels = useMemo(() => catalog.filter((m) => m.free), [catalog])
  const selectedModels = useMemo(
    () => catalog.filter((m) => selectedIds.includes(m.id)),
    [catalog, selectedIds]
  )

  const missingKeys = useMemo<Provider[]>(() => {
    const missing: Provider[] = []
    if (!keys.openrouter?.trim()) missing.push("openrouter")
    if (!keys.gemini?.trim()) missing.push("gemini")
    if (!keys.sarvam?.trim()) missing.push("sarvam")
    return missing
  }, [keys])

  const syncModels = useCallback(async () => {
    setSyncing(true)
    // Both catalogs are public; one failing shouldn't blank the other.
    const [orResult, sarvamResult] = await Promise.allSettled([
      fetchOpenRouterLiveModels({ apiKey: keys.openrouter }),
      fetchSarvamLiveModels(),
    ])

    const errors: string[] = []

    if (orResult.status === "fulfilled" && !orResult.value?.error) {
      setLiveModels(Array.isArray(orResult.value?.models) ? orResult.value.models : [])
    } else {
      setLiveModels(null)
      const reason =
        orResult.status === "rejected"
          ? String(orResult.reason)
          : String(orResult.value?.error ?? "unknown")
      errors.push(`OpenRouter: ${reason}`)
    }

    if (sarvamResult.status === "fulfilled" && !sarvamResult.value?.error) {
      setSarvamModels(Array.isArray(sarvamResult.value?.models) ? sarvamResult.value.models : [])
    } else {
      setSarvamModels(null)
      const reason =
        sarvamResult.status === "rejected"
          ? String(sarvamResult.reason)
          : String(sarvamResult.value?.error ?? "unknown")
      errors.push(`Sarvam: ${reason}`)
    }

    setSyncError(errors.length ? errors.join(" · ") : null)
    setSyncing(false)
  }, [keys.openrouter])

  /* ----------------------------------------------------------------- effects */

  useEffect(() => {
    if (!loading && !session) router.push("/?login=1")
  }, [session, loading, router])

  useEffect(() => {
    void syncModels()
  }, [syncModels])

  // Drop selections whose model has disappeared from a provider's catalog.
  // Only prunes once both syncs have resolved, so a slow fetch can't wipe a
  // valid selection mid-load.
  useEffect(() => {
    if (!liveModels || !sarvamModels) return
    const allowed = new Set(catalog.map((m) => m.id))
    setSelectedIds((prev) => prev.filter((id) => allowed.has(id)))
  }, [catalog, liveModels, sarvamModels, setSelectedIds])

  // One-time: fill the default selection from models that are actually live and
  // free right now, so the first run is never seeded with stale ids.
  useEffect(() => {
    if (defaultSeeded || !liveModels || freeModels.length === 0) return
    setSelectedIds((prev) => {
      const next = [...prev]
      for (const model of freeModels) {
        if (next.length >= MAX_SELECTED) break
        if (!next.includes(model.id)) next.push(model.id)
      }
      return next
    })
    setDefaultSeeded(true)
  }, [defaultSeeded, liveModels, freeModels, setSelectedIds, setDefaultSeeded])

  /* ------------------------------------------------------------------ turns */

  const rows = useMemo(() => {
    const out: { user: ChatMessage; answers: ChatMessage[] }[] = []
    for (const m of messages) {
      if (m.role === "user") out.push({ user: m, answers: [] })
      else if (m.role === "assistant" && out.length) out[out.length - 1].answers.push(m)
    }
    return out
  }, [messages])

  /* ----------------------------------------------------------------- actions */

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.left = "-9999px"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopiedKey(key)
    window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500)
  }

  const newChat = () => {
    const thread: ChatThread = {
      id: crypto.randomUUID(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    }
    setThreads((prev) => [thread, ...prev])
    setActiveId(thread.id)
    setSidebarOpen(false)
  }

  const toggleModel = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, id]
    })
  }

  const commitRename = (id: string) => {
    const title = renameValue.trim()
    if (title) setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)))
    setRenamingId(null)
    setRenameValue("")
  }

  const togglePin = (id: string) => {
    setThreads((prev) => {
      const target = prev.find((t) => t.id === id)
      if (!target) return prev
      const updated = { ...target, pinned: !target.pinned }
      const others = prev.filter((t) => t.id !== id)
      return updated.pinned
        ? [updated, ...others]
        : [...others.filter((t) => t.pinned), updated, ...others.filter((t) => !t.pinned)]
    })
  }

  const deleteThread = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id))
    if (activeId === id) setActiveId(null)
  }

  async function send(text: string, attachments: Attachment[] = []) {
    const typed = text.trim()
    if ((!typed && attachments.length === 0) || selectedModels.length === 0) return

    // Text files are inlined into the prompt so that even text-only models see
    // them. Binaries are passed through per-provider below.
    const prompt = buildPromptWithText(
      typed || "Please review the attached file(s).",
      attachments
    )
    const attachmentSummary = attachments.length
      ? ` [${attachments.map((a) => a.name).join(", ")}]`
      : ""

    const keyFor: Record<Provider, string | undefined> = {
      openrouter: keys.openrouter?.trim() || undefined,
      gemini: keys.gemini?.trim() || undefined,
      sarvam: keys.sarvam?.trim() || undefined,
    }
    const runnable = selectedModels.filter((m) => Boolean(keyFor[m.provider]))

    if (runnable.length === 0) {
      window.dispatchEvent(new Event("open-settings"))
      return
    }

    let thread = activeThread
    if (!thread) {
      thread = {
        id: crypto.randomUUID(),
        title: (typed || "Attached files").slice(0, 48),
        messages: [],
        createdAt: Date.now(),
      }
      setThreads((prev) => [thread as ChatThread, ...prev])
      setActiveId(thread.id)
    }
    const threadId = thread.id

    // What the models receive (files inlined) vs what the transcript shows.
    const userMsgForModel: ChatMessage = { role: "user", content: prompt, ts: Date.now() }
    const userMsgForDisplay: ChatMessage = {
      role: "user",
      content: `${typed || "Please review the attached file(s)."}${attachmentSummary}`,
      ts: userMsgForModel.ts,
    }
    const history = [...(thread.messages ?? []), userMsgForModel]

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              title:
                t.title === "New chat"
                  ? (typed || "Attached files").slice(0, 48)
                  : t.title,
              messages: [...(t.messages ?? []), userMsgForDisplay],
            }
          : t
      )
    )

    const appendAnswer = (content: string, modelId: string) => {
      const answer: ChatMessage = { role: "assistant", content, modelId, ts: Date.now() }
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, messages: [...(t.messages ?? history), answer] } : t
        )
      )
    }

    setLoadingIds(runnable.map((m) => m.id))

    await Promise.allSettled(
      selectedModels.map(async (model) => {
        const apiKey = keyFor[model.provider]
        if (!apiKey) {
          appendAnswer(
            `Add your ${PROVIDER_LABEL[model.provider]} API key in Settings to use this model.`,
            model.id
          )
          return
        }

        // Text files are already inside the prompt; only binaries vary by provider.
        const { unsupported } = binaryFor(model.provider, attachments)
        const caveat = unsupported.length
          ? `\n\n_Note: ${PROVIDER_LABEL[model.provider]} can't read ${unsupported
              .map((a) => a.name)
              .join(", ")}, so ${unsupported.length > 1 ? "they were" : "it was"} not sent._`
          : ""

        try {
          const res =
            model.provider === "gemini"
              ? await callGemini({ apiKey, model: model.model, messages: history, attachments })
              : model.provider === "sarvam"
                ? await callSarvam({ apiKey, model: model.model, messages: history })
                : await callOpenRouter({
                    apiKey,
                    model: model.model,
                    messages: history,
                    attachments,
                  })

          const r = res as { text?: unknown; error?: unknown } | null
          const text =
            (typeof r?.text === "string" ? r.text : undefined) ??
            (typeof r?.error === "string" ? r.error : undefined) ??
            "No response."
          appendAnswer(`${String(text).trim()}${caveat}`, model.id)
        } catch (err) {
          appendAnswer(`Error: ${err instanceof Error ? err.message : String(err)}`, model.id)
        } finally {
          setLoadingIds((prev) => prev.filter((x) => x !== model.id))
        }
      })
    )
  }

  /* ------------------------------------------------------------------ render */

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const needsKeys = missingKeys.length === 3
  const gridStyle = {
    gridTemplateColumns: `repeat(${Math.max(selectedModels.length, 1)}, minmax(280px, 1fr))`,
  }

  const sidebarProps = {
    threads,
    activeId,
    renamingId,
    renameValue,
    onSelect: (id: string) => {
      setActiveId(id)
      setSidebarOpen(false)
    },
    onNewChat: newChat,
    onStartRename: (thread: ChatThread) => {
      setRenamingId(thread.id)
      setRenameValue(thread.title || "")
    },
    onRenameChange: setRenameValue,
    onCommitRename: commitRename,
    onCancelRename: () => {
      setRenamingId(null)
      setRenameValue("")
    },
    onTogglePin: togglePin,
    onDelete: deleteThread,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar — persistent on desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <ChatSidebar {...sidebarProps} />
      </aside>

      {/* Sidebar — drawer on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-border bg-sidebar">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <ChatSidebar {...sidebarProps} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          <h1 className="min-w-0 flex-1 truncate text-sm font-medium">
            {activeThread?.title ?? "New chat"}
          </h1>

          <Button variant="outline" size="sm" className="h-8" onClick={() => setPickerOpen(true)}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Models</span>
            <span className="ml-0.5 tabular-nums text-muted-foreground">
              {selectedModels.length}
            </span>
          </Button>
          <Settings />
          <ThemeToggler />
        </header>

        {/* Selected model chips */}
        {selectedModels.length > 0 && (
          <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border px-4 py-2">
            {selectedModels.map((model) => (
              <button
                key={model.id}
                onClick={() => toggleModel(model.id)}
                title="Remove from comparison"
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-3 pr-2 text-xs text-foreground transition-colors hover:bg-accent"
              >
                <span className="max-w-[180px] truncate">{model.label}</span>
                <X className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground" />
              </button>
            ))}
            <button
              onClick={() => setPickerOpen(true)}
              className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-solid hover:bg-accent hover:text-foreground"
              aria-label="Add model"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Conversation */}
        <div className="min-h-0 flex-1 overflow-auto">
          {needsKeys ? (
            <EmptyState
              title="Add an API key to begin"
              body="PentAI uses your own keys — they stay in this browser and are free to create. One OpenRouter key unlocks every free model."
              action={
                <Button onClick={() => window.dispatchEvent(new Event("open-settings"))}>
                  Add API keys
                </Button>
              }
            />
          ) : selectedModels.length === 0 ? (
            <EmptyState
              title="No models selected"
              body={`Pick up to ${MAX_SELECTED} models and every prompt you send will go to all of them at once.`}
              action={<Button onClick={() => setPickerOpen(true)}>Select models</Button>}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title="Ask anything"
              body="Your prompt goes to every selected model in parallel. Their answers land side by side below."
            />
          ) : (
            <div className="mx-auto w-full px-4 py-6">
              <div className="min-w-full space-y-10">
                {rows.map((row, i) => (
                  <div key={i}>
                    {/* Prompt */}
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <p className="text-[15px] font-medium leading-relaxed text-foreground">
                        {row.user.content}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 shrink-0 text-xs text-muted-foreground"
                        onClick={() =>
                          copy(
                            selectedModels
                              .map((m) => {
                                const a = row.answers.find((x) => x.modelId === m.id)
                                return `## ${m.label}\n${a?.content ?? ""}`
                              })
                              .join("\n\n"),
                            `all-${i}`
                          )
                        }
                      >
                        {copiedKey === `all-${i}` ? (
                          <>
                            <Check className="h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy all
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Answers */}
                    <div className="grid gap-3" style={gridStyle}>
                      {selectedModels.map((model) => {
                        const answer = row.answers.find((a) => a.modelId === model.id)
                        const isLoading = !answer && loadingIds.includes(model.id)
                        const key = `${i}:${model.id}`

                        return (
                          <div
                            key={model.id}
                            className="group relative flex min-h-[160px] flex-col rounded-lg border border-border bg-card"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                              <span className="truncate text-xs font-medium text-foreground">
                                {model.label}
                              </span>
                              {answer && (
                                <button
                                  onClick={() => copy(answer.content, key)}
                                  aria-label="Copy answer"
                                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                                >
                                  {copiedKey === key ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              )}
                            </div>

                            <div className="flex-1 p-3 text-sm leading-relaxed">
                              {answer ? (
                                <MarkdownLite text={answer.content} />
                              ) : isLoading ? (
                                <div className="space-y-2 pt-1">
                                  {["w-2/3", "w-full", "w-5/6", "w-1/2"].map((w, n) => (
                                    <div
                                      key={n}
                                      className={cn("h-2.5 animate-pulse rounded-full bg-muted", w)}
                                      style={{ animationDelay: `${n * 120}ms` }}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">No response</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-border bg-background px-4 py-3">
          <AiInput onSubmit={send} loading={loadingIds.length > 0} />
        </div>
      </div>

      <ModelPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        catalog={catalog}
        selectedIds={selectedIds}
        onToggle={toggleModel}
        onClear={() => setSelectedIds([])}
        onRefresh={() => void syncModels()}
        syncing={syncing}
        syncError={syncError}
        missingKeys={missingKeys}
        onOpenSettings={() => {
          setPickerOpen(false)
          window.dispatchEvent(new Event("open-settings"))
        }}
      />
    </div>
  )
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex h-full items-center justify-center px-6 py-16">
      <div className="max-w-sm text-center">
        <h2 className="text-base font-medium text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
    </div>
  )
}
