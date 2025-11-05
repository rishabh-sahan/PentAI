"use client";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus, Github, Star, Check, EllipsisVertical, Pin, PinOff, Trash2, Edit, Moon, Sun } from "lucide-react";
import Settings from "@/components/Settings";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { MODEL_CATALOG } from "@/lib/models";
import { AiModel, ChatMessage, ApiKeys, ChatThread } from "@/lib/types";
import { callGemini, callOpenRouter } from "@/lib/client";
import { AiInput } from "@/components/AIChatBox";
import MarkdownLite from "@/components/MarkdownLite";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import ThemeToggler from "@/components/ThemeToggler";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>(
    "ai-fiesta:selected-models",
    [
      "gemini-2.5-flash",
      "llama-3.3-70b-instruct",
      "qwen-2.5-72b-instruct",
      "openai-gpt-oss-20b-free",
      "glm-4.5-air",
    ]
  );
  const [keys] = useLocalStorage<ApiKeys>("ai-fiesta:keys", {});
  const [threads, setThreads] = useLocalStorage<ChatThread[]>("ai-fiesta:threads", []);
  const [activeId, setActiveId] = useLocalStorage<string | null>("ai-fiesta:active-thread", null);
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>("ai-fiesta:sidebar-open", true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [modelsModalOpen, setModelsModalOpen] = useState(false);
  const [renamingThreadId, setRenamingThreadId] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState<string>('');
  const activeThread = useMemo(() => threads.find(t => t.id === activeId) || null, [threads, activeId]);
  const messages = useMemo(() => activeThread?.messages ?? [], [activeThread]);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const selectedModels = useMemo(() => MODEL_CATALOG.filter(m => selectedIds.includes(m.id)), [selectedIds]);
  const anyLoading = loadingIds.length > 0;
  const [copiedAllIdx, setCopiedAllIdx] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [firstNoteDismissed, setFirstNoteDismissed] = useLocalStorage<boolean>('ai-fiesta:first-visit-note-dismissed', false);
  const showFirstVisitNote = !firstNoteDismissed && (!keys?.openrouter || !keys?.gemini);

  const { session, loading } = useAuth();
  const router = useRouter();

  // Move this useMemo higher in the component, before any conditional returns
  const pairs = useMemo(() => {
    const rows: { user: ChatMessage; answers: ChatMessage[] }[] = [];
    let currentUser: ChatMessage | null = null;
    for (const m of messages) {
      if (m.role === "user") {
        currentUser = m;
        rows.push({ user: m, answers: [] });
      } else if (m.role === "assistant" && currentUser) {
        rows[rows.length - 1]?.answers.push(m);
      }
    }
    return rows;
  }, [messages]);
  
  // Then place this useEffect after all other hooks
  useEffect(() => {
    if (!loading && !session) {
      router.push('/?login=1');
    }
  }, [session, loading, router]);
  
  if (loading || !session) {
    return <div className="min-h-screen w-full bg-background relative text-foreground flex items-center justify-center">Loading...</div>;
  }

  // Copy helper with fallback when navigator.clipboard is unavailable
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore
      }
    }
  };

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      const valid = new Set(MODEL_CATALOG.map(m => m.id));
      const currentValidCount = prev.filter(x => valid.has(x)).length;
      if (currentValidCount >= 5) return prev;
      return [...prev, id];
    });
  };

  const handleRename = (id: string) => {
    if (renameInputValue.trim() === '') return;
    setThreads(prev => prev.map(t => t.id === id ? { ...t, title: renameInputValue.trim() } : t));
    setRenamingThreadId(null);
    setRenameInputValue('');
  };

  const handlePinToggle = (id: string) => {
    setThreads(prev => {
      const threadToToggle = prev.find(t => t.id === id);
      if (!threadToToggle) return prev;

      const updatedThread = { ...threadToToggle, pinned: !threadToToggle.pinned };

      if (updatedThread.pinned) {
        // If pinning, move to the top of the list
        return [updatedThread, ...prev.filter(t => t.id !== id)];
      } else {
        // If unpinning, remove from pinned, then sort by createdAt
        const unpinnedThreads = prev.filter(t => t.id !== id && !t.pinned);
        const pinnedThreads = prev.filter(t => t.id !== id && t.pinned);
        return [...pinnedThreads, updatedThread, ...unpinnedThreads.sort((a, b) => b.createdAt - a.createdAt)];
      }
    });
  };

  const handleDelete = (id: string) => {
    setThreads(prev => prev.filter(t => t.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  };

  function ensureThread() {
    if (activeThread) return activeThread;
    const t: ChatThread = { id: crypto.randomUUID(), title: "New Chat", messages: [], createdAt: Date.now() };
    setThreads(prev => [t, ...prev]);
    setActiveId(t.id);
    return t;
  }

  async function send(text: string, imageDataUrl?: string) {
    const prompt = text.trim();
    if (!prompt) return;
    if (selectedModels.length === 0) return alert("Select at least one model.");
    // Enforce BYOK: require user-provided keys for providers being used
    const needsOpenRouter = selectedModels.some((m) => m.provider === 'openrouter');
    const needsGemini = selectedModels.some((m) => m.provider === 'gemini');
    if ((needsOpenRouter && !keys.openrouter) || (needsGemini && !keys.gemini)) {
      alert('Please add your own API key(s) in Settings to use these models.');
      window.dispatchEvent(new Event('open-settings'));
      return;
    }
    const userMsg: ChatMessage = { role: "user", content: prompt, ts: Date.now() };
    const thread = ensureThread();
    const nextHistory = [...(thread.messages ?? []), userMsg];
    // set thread messages and optional title
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, title: thread.title === "New Chat" ? prompt.slice(0, 40) : t.title, messages: nextHistory } : t));
    // input reset handled within AiInput component

    // fire all selected models in parallel
    setLoadingIds(selectedModels.map(m => m.id));
    await Promise.allSettled(selectedModels.map(async (m: AiModel) => {
      try {
        let res: unknown;
        if (m.provider === "gemini") {
          res = await callGemini({ apiKey: keys.gemini || undefined, model: m.model, messages: nextHistory, imageDataUrl });
        } else {
          res = await callOpenRouter({ apiKey: keys.openrouter || undefined, model: m.model, messages: nextHistory });
        }
        const text = (() => {
          const r = res as { text?: unknown; error?: unknown } | null | undefined;
          const t = r && typeof r === 'object' ? (typeof r.text === 'string' ? r.text : undefined) : undefined;
          const e = r && typeof r === 'object' ? (typeof r.error === 'string' ? r.error : undefined) : undefined;
          return t || e || "No response";
        })();
        const asst: ChatMessage = { role: "assistant", content: String(text).trim(), modelId: m.id, ts: Date.now() };
        // Append to current thread messages to accumulate answers from multiple models
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, messages: [...(t.messages ?? nextHistory), asst] } : t));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const asst: ChatMessage = { role: "assistant", content: `[${m.label}] Error: ${msg}`.trim(), modelId: m.id, ts: Date.now() };
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, messages: [...(t.messages ?? nextHistory), asst] } : t));
      } finally {
        setLoadingIds(prev => prev.filter(x => x !== m.id));
      }
    }));
  }

  // group assistant messages by turn for simple compare view
  return (
    <div className="dashboard-root min-h-screen w-full bg-background relative text-foreground">
      <div
        className="absolute inset-0 z-0"
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <div className="relative z-10 px-3 lg:px-4 py-4 lg:py-6">
        <div className="flex gap-3 lg:gap-4">
          {/* Sidebar */}
          {/* Desktop sidebar */}
          <aside className={`relative hidden lg:flex shrink-0 h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] rounded-lg border border-sidebar-border bg-sidebar p-3 flex-col transition-[width] duration-300 ${sidebarOpen ? 'w-64' : 'w-14'}`}>
            {/* Collapse/Expand toggle */}
            <button
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute -right-3 top-5 z-10 h-6 w-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent-hover"
            >
              {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <div className={`flex items-center justify-between mb-2 ${sidebarOpen ? '' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h2 className="text-sm font-semibold">PentAI</h2>
              </div>

          {/* First-visit API keys modal */}
          {showFirstVisitNote && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                onClick={() => setFirstNoteDismissed(true)}
              />
              <div className="relative mx-3 w-full max-w-md sm:max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl">
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="text-base font-semibold tracking-wide">Some models need API keys</h3>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>You can generate API keys for free.</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>One OpenRouter key works across many models.</li>
                    <li>Gemini requires its own key.</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
                  <button
                    onClick={() => window.dispatchEvent(new Event('open-settings'))}
                    className="text-sm px-3 py-2 rounded bg-primary text-primary-foreground border border-primary-border hover:bg-primary/90"
                  >
                    Get API key for free
                  </button>
                  <button
                    onClick={() => setFirstNoteDismissed(true)}
                    className="text-sm px-3 py-2 rounded bg-secondary text-secondary-foreground border border-border hover:bg-secondary/90"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

            {/* First-visit API keys notice is now a centered modal shown below */}
            </div>

            {/* When collapsed, show only a big plus button centered */}
            {sidebarOpen ? (
              <>
                <button
                  onClick={() => {
                    const t: ChatThread = { id: crypto.randomUUID(), title: 'New Chat', messages: [], createdAt: Date.now() };
                    setThreads(prev => [t, ...prev]);
                    setActiveId(t.id);
                  }}
                  className="mb-3 text-sm px-3 py-2 rounded-md bg-primary hover:bg-primary/90"
                >
                  + New Chat
                </button>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Chats</div>
                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                  {threads.length === 0 && <div className="text-xs opacity-60">No chats yet</div>}
                  {threads.map(t => (
                    <div key={t.id} className="group relative flex items-center">
                      {renamingThreadId === t.id ? (
                        <input
                          autoFocus
                          value={renameInputValue}
                          onChange={(e) => setRenameInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRename(t.id);
                            } else if (e.key === 'Escape') {
                              setRenamingThreadId(null);
                              setRenameInputValue('');
                            }
                          }}
                          onBlur={() => handleRename(t.id)}
                          className="w-full bg-card border border-border rounded-md text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      ) : (
                        <div 
                          onClick={() => setActiveId(t.id)} 
                          className={`w-full text-left px-2 py-2 rounded-md text-sm border flex items-center justify-between cursor-pointer ${t.id === activeId ? 'bg-secondary border-secondary-foreground' : 'bg-card border-border hover:bg-card/80'}`}
                        >
                          <span className="truncate flex items-center gap-1">
                            {t.title || 'Untitled'}
                          </span>
                          <div className="flex items-center">
                            {t.pinned && <Pin size={12} className="shrink-0 text-muted-foreground mr-1" />}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="w-7 h-7 flex items-center justify-center rounded-full">
                                  <EllipsisVertical size={14} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 bg-card border-border text-foreground">
                                <DropdownMenuItem onClick={() => {
                                  setRenamingThreadId(t.id);
                                  setRenameInputValue(t.title || '');
                                }} className="cursor-pointer">
                                  <Edit size={14} className="mr-2" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePinToggle(t.id)} className="cursor-pointer">
                                  {t.pinned ? (
                                    <><PinOff size={14} className="mr-2" /> Unpin</>
                                  ) : (
                                    <><Pin size={14} className="mr-2" /> Pin</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-zinc-700" />
                                <DropdownMenuItem onClick={() => handleDelete(t.id)} className="cursor-pointer text-red-400">
                                  <Trash2 size={14} className="mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center pt-6">
                {/* New chat button */}
                <button
                  title="New Chat"
                  onClick={() => {
                    const t: ChatThread = { id: crypto.randomUUID(), title: 'New Chat', messages: [], createdAt: Date.now() };
                    setThreads(prev => [t, ...prev]);
                    setActiveId(t.id);
                  }}
                  className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center mb-4 mx-auto shrink-0"
                >
                  <Plus size={14} />
                </button>

                {/* Mini chat boxes list */}
                <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-2 pt-1 pb-2">
                  {threads.map(t => {
                    const isActive = t.id === activeId;
                    const letter = (t.title || 'Untitled').trim()[0]?.toUpperCase() || 'N';
                    return (
                      <DropdownMenu key={t.id}>
                        <DropdownMenuTrigger asChild>
                          <button
                            title={t.title || 'Untitled'}
                            onClick={() => setActiveId(t.id)}
                            className={`h-6 w-6 aspect-square rounded-full flex items-center justify-center transition-colors focus-visible:outline-none mx-auto shrink-0 
                              ${isActive ? 'bg-secondary ring-1 ring-secondary-foreground ring-offset-1 ring-offset-background' : 'bg-card hover:bg-card/80'}`}
                          >
                            <span className="text-[10px] font-semibold leading-none flex items-center gap-0.5">
                              {t.pinned && <Pin size={8} className="shrink-0 text-muted-foreground" />}
                              {letter}
                            </span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-card border-border text-foreground">
                          <DropdownMenuItem onClick={() => {
                            setRenamingThreadId(t.id);
                            setRenameInputValue(t.title || '');
                            setSidebarOpen(true); // Open sidebar to show input field
                          }} className="cursor-pointer">
                            <Edit size={14} className="mr-2" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePinToggle(t.id)} className="cursor-pointer">
                            {t.pinned ? (
                              <><PinOff size={14} className="mr-2" /> Unpin</>
                            ) : (
                              <><Pin size={14} className="mr-2" /> Pin</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-700" />
                          <DropdownMenuItem onClick={() => handleDelete(t.id)} className="cursor-pointer text-red-400">
                            <Trash2 size={14} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* Mobile sidebar drawer */}
          {mobileSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#e42a42]" />
                    <h2 className="text-sm font-semibold">PentAI</h2>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)} className="text-xs px-2 py-1 rounded bg-card border border-border">Close</button>
                </div>
                <button
                  onClick={() => {
                    const t: ChatThread = { id: crypto.randomUUID(), title: 'New Chat', messages: [], createdAt: Date.now() };
                    setThreads(prev => [t, ...prev]);
                    setActiveId(t.id);
                    setMobileSidebarOpen(false);
                  }}
                  className="mb-3 text-sm px-3 py-2 w-full rounded-md bg-[#e42a42] hover:bg-[#cf243a]"
                >
                  + New Chat
                </button>
                <div className="text-xs uppercase tracking-wide opacity-60 mb-2">Chats</div>
                <div className="h-[70vh] overflow-y-auto space-y-1 pr-1">
                  {threads.length === 0 && <div className="text-xs opacity-60">No chats yet</div>}
                  {threads.map(t => (
                    <button key={t.id} onClick={() => { setActiveId(t.id); setMobileSidebarOpen(false); }} className={`w-full text-left px-2 py-2 rounded-md text-sm border ${t.id === activeId ? 'bg-card border-border' : 'bg-card border-border hover:bg-card/80'}`}>
                      {t.title || 'Untitled'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] overflow-hidden">
            {/* Top bar */}
          <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden text-xs px-2 py-1 rounded bg-card border border-border">Menu</button>
                <h1 className="text-lg font-semibold">PentAI</h1>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggler />
              </div>
            </div>

            {/* Selected models row + Change button */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {selectedModels.map((m) => {
                const isFree = /(\(|\s)free\)/i.test(m.label);
                const isUncensored = /uncensored/i.test(m.label) || /venice/i.test(m.model);
                return (
                <button
                  key={m.id}
                  onClick={() => toggle(m.id)}
                  className={`h-9 px-3 text-xs rounded-full text-foreground dark:text-white border flex items-center gap-2 bg-card dark:bg-white/5 hover:bg-accent dark:hover:bg-white/10 transition-colors ${
                    m.good ? 'border-amber-300/40' : isFree ? 'border-emerald-300/40' : 'border-border'
                  }`}
                  title="Click to toggle"
                >
                  {m.good && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/30">
                      <Star size={12} className="shrink-0" />
                      <span className="hidden sm:inline">Pro</span>
                    </span>
                  )}
                  {isFree && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30">
                      <span className="h-2 w-2 rounded-full bg-emerald-300" />
                      <span className="hidden sm:inline">Free</span>
                    </span>
                  )}
                  {isUncensored && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 ring-1 ring-rose-300/30">
                      <span className="h-2 w-2 rounded-full bg-rose-200" />
                      <span className="hidden sm:inline">Uncensored</span>
                    </span>
                  )}
                  <span className="truncate max-w-[180px]">{m.label}</span>
                  <span className="relative inline-flex h-4 w-7 items-center rounded-full bg-orange-500/40">
                    <span className="h-3 w-3 rounded-full bg-orange-200 translate-x-3.5" />
                  </span>
                </button>
              );})}
              {selectedModels.length === 0 && (
                <span className="text-xs text-muted-foreground">No models selected</span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setModelsModalOpen(true)}
                  className="text-xs px-2.5 py-1 rounded border border-border bg-card hover:bg-card/80"
                >
                  Change models
                </button>
                <Settings />
              </div>
            </div>

            {modelsModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModelsModalOpen(false)} />
                <div className="relative w-full max-w-2xl mx-auto rounded-2xl border border-border bg-card p-5 shadow-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold tracking-wide">Select up to 5 models</h3>
                    <button onClick={() => setModelsModalOpen(false)} className="text-xs px-2 py-1 rounded bg-white/10">Close</button>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">Selected: {selectedModels.length}/5</div>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {(() => {
                      const buckets: Record<string, typeof MODEL_CATALOG> = {
                        Favorites: [],
                        Uncensored: [],
                        Free: [],
                        Good: [],
                        Others: [],
                      };
                      const seen = new Set<string>();
                      const isFree = (m: AiModel) => /(\(|\s)free\)/i.test(m.label) || m.free;
                      const isUnc = (m: AiModel) => /uncensored/i.test(m.label) || /venice/i.test(m.model);
                      const staticFavIds = new Set<string>([
                        'llama-3.3-70b-instruct',
                        'gemini-2.5-pro',
                        'openai-gpt-oss-20b-free',
                        'glm-4.5-air',
                        'moonshot-kimi-k2',
                      ]);
                      const isFav = (m: AiModel) => selectedIds.includes(m.id) || staticFavIds.has(m.id);
                      const pick = (m: AiModel) => {
                        if (isFav(m)) return 'Favorites';
                        if (isUnc(m)) return 'Uncensored';
                        if (isFree(m)) return 'Free';
                        if (m.good) return 'Good';
                        return 'Others';
                      };
                      MODEL_CATALOG.forEach((m) => {
                        const key = pick(m);
                        if (!seen.has(m.id)) {
                          buckets[key].push(m);
                          seen.add(m.id);
                        }
                      });

                      const order: Array<keyof typeof buckets> = ['Favorites', 'Uncensored', 'Free', 'Good', 'Others'];
                      return order.filter((k) => buckets[k].length > 0).map((k) => (
                        <div key={k} className="space-y-2">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">{k}</div>
                          <div className="flex flex-wrap gap-2">
                            {buckets[k].map((m) => {
                              const free = isFree(m);
                              const unc = isUnc(m);
                              const selected = selectedIds.includes(m.id);
                              const disabled = !selected && selectedModels.length >= 5;
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => !disabled && toggle(m.id)}
                                  className={`h-9 px-3 text-xs rounded-full border transition-colors flex items-center justify-between gap-3 min-w-[260px] ${
                                    selected
                                      ? `${m.good ? 'border-amber-300/50' : free ? 'border-emerald-300/50' : 'border-white/20'} bg-white/10`
                                      : disabled
                                        ? 'bg-white/5 text-zinc-500 border-white/10 cursor-not-allowed opacity-60'
                                        : `${m.good ? 'border-amber-300/30' : free ? 'border-emerald-300/30' : 'border-white/10'} bg-white/5 hover:bg-white/10`
                                  }`}
                                  title={selected ? 'Click to unselect' : disabled ? 'Limit reached' : 'Click to select'}
                                >
                                  <span className="pr-1 inline-flex items-center gap-1.5 min-w-0">
                                    {m.good && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/30">
                                        <Star size={12} className="shrink-0" />
                                        <span className="hidden sm:inline">Pro</span>
                                      </span>
                                    )}
                                    {free && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30">
                                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                        <span className="hidden sm:inline">Free</span>
                                      </span>
                                    )}
                                    {unc && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 ring-1 ring-rose-300/30">
                                        <span className="h-2 w-2 rounded-full bg-rose-200" />
                                        <span className="hidden sm:inline">Uncensored</span>
                                      </span>
                                    )}
                                    <span className="truncate max-w-[150px] sm:max-w-[200px]">{m.label}</span>
                                  </span>
                                  {/* Toggle visual */}
                                  <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${selected ? 'bg-orange-500/40' : 'bg-white/10'}`}>
                                    <span className={`h-3 w-3 rounded-full transition-transform ${selected ? 'bg-orange-200 translate-x-3.5' : 'bg-white translate-x-0.5'}`} />
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Messages area */}
            <div className="rounded-lg border border-border bg-card dark:border-white/10 dark:bg-white/5 px-2 pt-5 overflow-x-auto flex-1 overflow-y-auto pb-28 text-foreground">
              {selectedModels.length === 0 ? (
                <div className="p-4 text-zinc-400">Select up to 5 models to compare.</div>
              ) : (
                <div className="min-w-full space-y-3">
                  {/* Header row: model labels */}
                  <div
                    className="grid gap-3 items-center overflow-visible mt-3 pt-1"
                    style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(260px, 1fr))` }}
                  >
                    {selectedModels.map((m) => {
                      const isFree = /(\(|\s)free\)/i.test(m.label);
                      return (
                      <div key={m.id} className={`px-1 py-5 min-h-[60px] border-b flex items-center justify-between overflow-visible ${m.good ? 'border-amber-300/40' : 'border-white/10'}`}>
                        <div className={`text-[13px] leading-normal font-medium pr-2 inline-flex items-center gap-1.5 min-w-0 ${m.good || isFree ? 'opacity-100 text-white' : 'opacity-90'}`}>
                          {m.good && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/30 text-[11px] h-6 self-center">
                              <Star size={11} />
                              <span className="hidden sm:inline">Pro</span>
                            </span>
                          )}
                          {isFree && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30 text-[11px] h-6 self-center">
                              <span className="h-2 w-2 rounded-full bg-emerald-300" />
                              <span className="hidden sm:inline">Free</span>
                            </span>
                          )}
                          <span className="truncate">{m.label}</span>
                        </div>
                        {loadingIds.includes(m.id) && <span className="text-[11px] text-[#e42a42]">Thinking…</span>}
                      </div>
                    );})}
                  </div>

                  {/* Rows: one per user turn, with a cell per model aligned */}
                  {pairs.map((row, i) => (
                    <div key={i} className="space-y-2">
                      {/* Optional: show the user prompt spanning all columns */}
                      <div className="text-sm text-zinc-300 flex items-center justify-between gap-2">
                        <div>
                          <span className="opacity-60">You:</span> {row.user.content}
                        </div>
                        <button
                          onClick={() => {
                            const all = selectedModels.map((m) => {
                              const ans = row.answers.find((a) => a.modelId === m.id);
                              const header = m.label;
                              const body = ans?.content ?? '';
                              return `## ${header}\n${body}`;
                            }).join('\n\n');
                            copyToClipboard(all);
                            setCopiedAllIdx(i);
                            window.setTimeout(() => setCopiedAllIdx(null), 1200);
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-md border shadow-sm transition-all ${
                            copiedAllIdx === i
                              ? 'bg-emerald-500/20 border-emerald-300/40 text-emerald-100 scale-[1.02]'
                              : 'bg-white/10 border-white/15 hover:bg-white/15'
                          }`}
                          title="Copy all model responses for this prompt"
                        >
                          {copiedAllIdx === i ? (
                            <span className="inline-flex items-center gap-1">
                              <Check size={12} /> Copied
                            </span>
                          ) : (
                            'Copy all'
                          )}
                        </button>
                      </div>
                      <div
                        className="grid gap-3 items-stretch"
                        style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(260px, 1fr))` }}
                      >
                        {selectedModels.map((m) => {
                          const isFree = /(\(|\s)free\)/i.test(m.label);
                          const ans = row.answers.find((a) => a.modelId === m.id);
                          return (
                            <div key={m.id} className="h-full">
                              <div className={`group relative rounded-md p-3 h-full min-h-[160px] flex overflow-hidden ring-1 ${m.good ? 'bg-gradient-to-b from-amber-50/10 to-card ring-amber-300/30 dark:from-amber-400/10 dark:to-white/5' : isFree ? 'bg-gradient-to-b from-emerald-50/10 to-card ring-emerald-300/30 dark:from-emerald-400/10 dark:to-white/5' : 'bg-card dark:bg-white/5 dark:ring-white/5 ring-border'}`}>
                                {ans && (
                                  <button
                                    onClick={() => {
                                      copyToClipboard(ans.content);
                                      const key = `${i}:${m.id}`;
                                      setCopiedKey(key);
                                      window.setTimeout(() => setCopiedKey(prev => (prev === key ? null : prev)), 1200);
                                    }}
                                    className={`absolute top-2 right-2 z-10 text-[11px] px-2 py-1 rounded border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all ${
                                      copiedKey === `${i}:${m.id}`
                                        ? 'bg-emerald-500/20 border-emerald-300/40 text-emerald-100 scale-[1.02]'
                                        : 'bg-white/10 border-white/10 hover:bg-white/15'
                                    }`}
                                    title={`Copy ${m.label} response`}
                                  >
                                    {copiedKey === `${i}:${m.id}` ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Check size={12} /> Copied
                                      </span>
                                    ) : (
                                      'Copy'
                                    )}
                                  </button>
                                )}
                                <div className="text-sm leading-relaxed w-full pr-8">
                                  {ans ? (
                                    <>
                                      <MarkdownLite text={ans.content} />
                                      {(() => {
                                        try {
                                          const txt = String(ans.content || '');
                                          // Show CTA for shared-key guidance (OpenRouter or Gemini)
                                          const show = /add your own\s+(?:openrouter|gemini)\s+api key/i.test(txt);
                                          return show;
                                        } catch { return false; }
                                      })() && (
                                        <div className="mt-2">
                                          <button
                                            onClick={() => window.dispatchEvent(new Event('open-settings'))}
                                            className="text-xs px-2.5 py-1 rounded bg-[#e42a42] text-white border border-white/10 hover:bg-[#cf243a]"
                                          >
                                            Add keys
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  ) : loadingIds.includes(m.id) ? (
                                            <div className="w-full self-stretch animate-pulse space-y-2">
                                                <div className="h-2.5 w-1/3 rounded bg-[#e42a42]/30" />
                                                <div className="h-2 rounded bg-card" />
                                                <div className="h-2 rounded bg-card w-5/6" />
                                                <div className="h-2 rounded bg-card w-2/3" />
                                              </div>
                                  ) : (
                                    <span className="opacity-40">No reply yet</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fixed bottom input line */}
            <div className="fixed bottom-0 left-0 right-0 z-20 pt-2 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t dark:from-black/70 from-foreground/10 to-transparent">
              <div
                className="w-full px-3 lg:px-4 lg:pl-[var(--dashboard-sidebar-offset)]"
                style={{ ['--dashboard-sidebar-offset' as any]: sidebarOpen ? 'calc(16rem + 1.5rem)' : 'calc(3.5rem + 1.5rem)' }}
              >
                <AiInput onSubmit={(text, imageDataUrl) => { send(text, imageDataUrl); }} loading={anyLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
