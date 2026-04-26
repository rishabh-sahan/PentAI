"use client"

import { ArrowRight, Check, Sparkles, Zap, Brain, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { LoginModal } from "@/components/auth/LoginModal"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { Header } from "./header"

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
      {/* Abstract gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary glow - top left */}
        <div
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-[0.08] dark:opacity-[0.12] blur-[120px]"
          style={{ background: "var(--primary)" }}
        />
        {/* Accent glow - bottom right */}
        <div
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full opacity-[0.06] dark:opacity-[0.10] blur-[140px]"
          style={{ background: "var(--accent)" }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(var(--foreground) 1px, transparent 1px),
              linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial fade */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_80%)]" />
      </div>

      <div className="relative z-20">
        <Header />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1320px] flex-col px-5 pb-12 pt-12 md:pb-16 md:pt-20">
        {/* Two-column hero layout */}
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          {/* Left column - Text */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Multi-model AI workspace for builders
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Compare the best AI answers in one focused workspace.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
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

          {/* Right column - Visual */}
          <div className="relative hidden lg:flex items-center justify-center min-h-[520px]">
            {/* Background pentagon shape */}
            <svg
              viewBox="0 0 400 400"
              className="absolute w-full h-full opacity-[0.06] dark:opacity-[0.08]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M200 20 L380 140 L310 350 L90 350 L20 140 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-primary"
              />
              <path
                d="M200 60 L340 155 L280 320 L120 320 L60 155 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary/50"
              />
            </svg>

            {/* Floating model cards */}
            {/* Card 1 - top right */}
            <div
              className="absolute top-4 right-0 w-52 rounded-lg border border-border bg-card/90 p-4 shadow-lg backdrop-blur-sm"
              style={{ animation: "floatCard1 6s ease-in-out infinite" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-md bg-emerald-500/15 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Gemini 2.5 Flash</div>
                  <div className="text-[10px] text-muted-foreground">Google</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded bg-muted" />
                <div className="h-1.5 w-4/5 rounded bg-muted" />
                <div className="h-1.5 w-3/5 rounded bg-primary/20" />
              </div>
            </div>

            {/* Card 2 - middle left */}
            <div
              className="absolute top-1/3 -left-4 w-52 rounded-lg border border-border bg-card/90 p-4 shadow-lg backdrop-blur-sm"
              style={{ animation: "floatCard2 7s ease-in-out infinite" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-md bg-blue-500/15 flex items-center justify-center">
                  <Brain className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Llama 3.3 70B</div>
                  <div className="text-[10px] text-muted-foreground">Meta • Free</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded bg-muted" />
                <div className="h-1.5 w-3/4 rounded bg-muted" />
                <div className="h-1.5 w-5/6 rounded bg-primary/20" />
              </div>
            </div>

            {/* Card 3 - bottom right */}
            <div
              className="absolute bottom-12 right-4 w-52 rounded-lg border border-border bg-card/90 p-4 shadow-lg backdrop-blur-sm"
              style={{ animation: "floatCard3 8s ease-in-out infinite" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-md bg-violet-500/15 flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Qwen 2.5 72B</div>
                  <div className="text-[10px] text-muted-foreground">Alibaba • Free</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded bg-muted" />
                <div className="h-1.5 w-2/3 rounded bg-muted" />
                <div className="h-1.5 w-4/5 rounded bg-primary/20" />
              </div>
            </div>

            {/* Center pentagon icon */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="h-28 w-28 rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L22 9.27L18.18 21H5.82L2 9.27L12 2Z"
                    fill="url(#heroLogoGrad)"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    className="text-primary/40"
                  />
                  <defs>
                    <linearGradient id="heroLogoGrad" x1="2" y1="2" x2="22" y2="21">
                      <stop stopColor="hsl(var(--primary))" />
                      <stop offset="1" stopColor="hsl(var(--primary)/0.3)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              {/* Orbit ring */}
              <div
                className="absolute h-48 w-48 rounded-full border border-dashed border-primary/15"
                style={{ animation: "spin 30s linear infinite" }}
              />
              <div
                className="absolute h-72 w-72 rounded-full border border-dashed border-primary/10"
                style={{ animation: "spin 45s linear infinite reverse" }}
              />
            </div>

            {/* Decorative connector lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 520">
              <line x1="250" y1="240" x2="400" y2="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-primary/15" />
              <line x1="250" y1="260" x2="80" y2="200" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-primary/15" />
              <line x1="250" y1="280" x2="380" y2="400" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-primary/15" />
            </svg>
          </div>
        </div>

        {/* Stats + key notice — below the two-column hero */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "5", label: "Models at once" },
            { value: "Local", label: "Key storage" },
            { value: "BYOK", label: "Workspace model" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
              <div className="text-3xl font-semibold text-foreground">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
          <div className="rounded-lg border border-primary/25 bg-primary/10 p-5 text-primary flex items-center">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              Your keys stay in your browser storage
            </div>
          </div>
        </div>
      </div>

      {/* Float keyframes */}
      <style jsx>{`
        @keyframes floatCard1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes floatCard2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(-1.5deg); }
        }
        @keyframes floatCard3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </section>
  )
}
