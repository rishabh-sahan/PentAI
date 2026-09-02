"use client"

import { ArrowRight, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { LoginModal } from "@/components/auth/LoginModal"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { HeroDemo } from "./hero-demo"

const PROOF_POINTS = ["5 models at once", "Free models included", "No subscription"]

export function HeroSection() {
  const { session } = useAuth()
  const router = useRouter()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleGetStarted = () => {
    if (session) router.push("/dashboard")
    else setIsLoginModalOpen(true)
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="aurora" aria-hidden="true" />

      {/*
        The Header deliberately lives in app/page.tsx, not here: this section
        needs overflow-hidden for the aurora blur, and an overflow-hidden
        ancestor traps position:sticky inside it — the header would scroll
        away as soon as the hero left the viewport.
      */}
      <div className="relative z-10">
        <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div
              data-reveal
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-xs font-medium text-primary"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              OpenRouter · Gemini · Sarvam — synced live
            </div>

            <h1
              data-reveal
              data-reveal-delay="60"
              className="mt-6 text-4xl font-semibold leading-[1.07] tracking-tight text-foreground sm:text-5xl md:text-6xl"
            >
              Don&apos;t trust one AI.
              <br />
              <span className="text-primary">Ask five at once.</span>
            </h1>

            <p
              data-reveal
              data-reveal-delay="120"
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Type your question once. PentAI sends it to five AI models at the same time and puts
              their answers side by side — so you can spot the one that actually got it right.
            </p>

            <div
              data-reveal
              data-reveal-delay="180"
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Button onClick={handleGetStarted} size="lg" className="h-11 w-full px-6 sm:w-auto">
                Start comparing — free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 w-full px-6 sm:w-auto">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>

            <ul
              data-reveal
              data-reveal-delay="240"
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            >
              {PROOF_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal data-reveal-delay="300" className="mx-auto mt-14 max-w-5xl md:mt-18">
            <HeroDemo />
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </section>
  )
}
