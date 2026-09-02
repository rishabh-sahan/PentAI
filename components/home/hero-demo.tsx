"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"

/*
  Looping demo of the real mechanic: a question types itself, then five model
  columns fill in at staggered speeds — the way answers actually arrive, since
  the models are called in parallel and finish at different times. The question
  rotates each cycle so the page never looks like a frozen screenshot.

  Driven by timers + CSS keyframes rather than an animation library, so it
  costs nothing in bundle size. Honours prefers-reduced-motion by holding the
  finished state instead of looping.
*/

type Demo = {
  prompt: string
  answers: string[][]
}

const MODELS = [
  { name: "Gemma 4 31B", badge: "Free", speed: 1.0 },
  { name: "GLM 5.2", badge: "Free", speed: 1.35 },
  { name: "Sarvam 105B", badge: "Sarvam", speed: 0.8 },
  { name: "Gemini 2.5 Flash", badge: "Gemini", speed: 1.15 },
  { name: "DeepSeek V4", badge: "Free", speed: 0.65 },
]

const DEMOS: Demo[] = [
  {
    prompt: "Explain database indexing to a junior engineer",
    answers: [
      ["An index is like a book's index —", "you jump straight to the page", "instead of reading all of them."],
      ["A sorted lookup table that", "trades slower writes for", "much faster reads."],
      ["Think of a phone book sorted", "by surname. Finding 'Patel' is", "instant; unsorted, you'd scan."],
      ["It's a data structure that lets", "the database skip most rows", "when answering a query."],
      ["Without one, every query scans", "the whole table. With one, it", "goes straight to the match."],
    ],
  },
  {
    prompt: "Is it worth learning Rust in 2026?",
    answers: [
      ["Yes if you write systems code.", "Otherwise the payoff is slower", "than the learning curve."],
      ["Strong yes — memory safety", "without a GC is still rare,", "and hiring demand is climbing."],
      ["Depends on your goals. For web", "work, Go or TypeScript will pay", "off faster."],
      ["Worth it for the concepts alone.", "Ownership changes how you think", "about every other language."],
      ["Only if you have a real project.", "Rust punishes tutorial-only", "learning harder than most."],
    ],
  },
  {
    prompt: "Write a polite email declining a meeting",
    answers: [
      ["Thanks for the invite — I can't", "make this one, but happy to", "read the notes afterwards."],
      ["Appreciate you thinking of me.", "I'm stretched this week; could", "we pick it up next sprint?"],
      ["Unfortunately I have a conflict.", "Would async notes work, or", "shall we find another slot?"],
      ["Sorry to miss it. I don't think", "I'd add much here — please", "loop me in if that changes."],
      ["Thank you for the invitation.", "I'm unavailable then; happy to", "contribute in writing instead."],
    ],
  },
  {
    prompt: "What's the difference between AI and machine learning?",
    answers: [
      ["AI is the goal; ML is one way", "of getting there — by learning", "patterns from data."],
      ["All ML is AI. Not all AI is ML —", "rule-based systems count too."],
      ["AI is the umbrella. ML is the", "branch where the system improves", "from examples rather than rules."],
      ["Think nested circles: AI outside,", "ML inside it, deep learning", "inside that."],
      ["AI = machines doing smart things.", "ML = machines getting smarter", "from data instead of code."],
    ],
  },
]

const TYPE_MS = 40
const READ_MS = 3400

export function HeroDemo() {
  const [demoIndex, setDemoIndex] = useState(0)
  const [typed, setTyped] = useState(0)
  const [answering, setAnswering] = useState(false)
  const timers = useRef<number[]>([])

  const demo = DEMOS[demoIndex]

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setTyped(demo.prompt.length)
      setAnswering(true)
      return
    }

    timers.current.forEach(window.clearTimeout)
    timers.current = []

    setTyped(0)
    setAnswering(false)

    for (let i = 1; i <= demo.prompt.length; i++) {
      timers.current.push(window.setTimeout(() => setTyped(i), i * TYPE_MS))
    }

    const typingDone = demo.prompt.length * TYPE_MS
    timers.current.push(window.setTimeout(() => setAnswering(true), typingDone + 240))
    timers.current.push(
      window.setTimeout(() => setDemoIndex((i) => (i + 1) % DEMOS.length), typingDone + READ_MS + 2200)
    )

    return () => {
      timers.current.forEach(window.clearTimeout)
      timers.current = []
    }
  }, [demoIndex, demo.prompt])

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Prompt bar */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 truncate text-sm text-foreground">
          {demo.prompt.slice(0, typed)}
          {typed < demo.prompt.length && (
            <span className="caret ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-primary" />
          )}
        </p>
        <span className="hidden shrink-0 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground sm:inline-block">
          Ask 5 models
        </span>
      </div>

      {/* Answer columns — scrolls horizontally on narrow screens rather than squashing */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[860px] grid-cols-5 gap-px bg-border">
          {MODELS.map((model, col) => (
            <div key={model.name} className="min-h-[172px] bg-card p-3.5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-medium text-foreground">{model.name}</span>
                <span
                  className={
                    model.badge === "Free"
                      ? "shrink-0 rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-medium text-gold-foreground"
                      : "shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  }
                >
                  {model.badge}
                </span>
              </div>

              {answering ? (
                <div className="space-y-1.5">
                  {demo.answers[col].map((line, i) => (
                    <p
                      key={`${demoIndex}-${col}-${i}`}
                      className="text-[12.5px] leading-relaxed text-muted-foreground"
                      style={{
                        animation: `fadeUp 400ms cubic-bezier(0.16,1,0.3,1) ${
                          i * 210 * model.speed
                        }ms both`,
                      }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 pt-1" aria-hidden="true">
                  {["w-2/3", "w-full", "w-5/6"].map((w, i) => (
                    <div
                      key={i}
                      className={`h-2.5 animate-pulse rounded-full bg-muted ${w}`}
                      style={{ animationDelay: `${i * 140}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}
