"use client"

import Image from "next/image"
import { ArrowRight, Check, KeyRound, Layers3, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { LoginModal } from "@/components/auth/LoginModal"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { Header } from "./header"

const stats = [
  { label: "models at once", value: "5" },
  { label: "key storage", value: "local" },
  { label: "workspace", value: "BYOK" },
]

export function HeroSection() {
  const { session } = useAuth()
  const router = useRouter()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard")
    } else {
      setIsLoginModalOpen(true)
    }
  }

  return (
    <section className="relative min-h-[760px] overflow-hidden border-b border-border bg-background">
      <div className="absolute inset-0">
        <Image
          src="/images/product-ui.jpeg"
          alt="PentAI multi-model dashboard"
          fill
          priority
          className="object-cover object-center opacity-20 dark:opacity-24"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklab,var(--background)_78%,transparent)_38%,var(--background)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_70%,transparent)_45%,var(--background)_100%)]" />
      </div>

      <div className="relative z-20">
        <Header />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1320px] flex-col px-5 pb-12 pt-12 md:pb-16 md:pt-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Multi-model AI workspace for builders
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Compare the best AI answers in one focused workspace.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            PentAI lets you chat with Gemini and OpenRouter models side by side, keep threaded work organized, and use your own API keys without turning your browser into a tab maze.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleGetStarted} size="lg" className="h-12 px-6 text-base">
              Open workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
              <a href="#compare">See comparison flow</a>
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {["Parallel replies", "Pinned chats", "Live model sync", "Light and dark mode"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-md border border-border bg-card/70 px-3 py-2">
                <Check className="h-4 w-4 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="overflow-hidden rounded-lg border border-border bg-card/80 shadow-2xl shadow-foreground/10 backdrop-blur">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Layers3 className="h-4 w-4 text-primary" />
                Live comparison
              </div>
              <div className="text-xs text-muted-foreground">5 selected models</div>
            </div>
            <div className="grid min-h-[300px] gap-3 p-4 md:grid-cols-3">
              {["Gemini 2.5 Flash", "Llama 3.3 70B", "Qwen 2.5"].map((model, index) => (
                <div key={model} className="rounded-md border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                    <span className="truncate text-sm font-semibold">{model}</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                      {index === 0 ? "Fast" : "Free"}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-2.5 w-2/3 rounded bg-primary/25" />
                    <div className="h-2 rounded bg-muted" />
                    <div className="h-2 w-5/6 rounded bg-muted" />
                    <div className="h-2 w-3/4 rounded bg-muted" />
                  </div>
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    Side-by-side output makes strengths, tone, and tradeoffs easy to scan.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
                <div className="text-3xl font-semibold text-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
            <div className="rounded-lg border border-primary/25 bg-primary/10 p-5 text-primary">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="h-4 w-4" />
                Your keys stay in your browser storage
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </section>
  )
}
