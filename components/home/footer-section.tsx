"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/auth/LoginModal"
import { useAuth } from "@/context/AuthContext"

export function FooterSection() {
  const { session } = useAuth()
  const router = useRouter()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleGetStarted = () => {
    if (session) router.push("/dashboard")
    else setIsLoginModalOpen(true)
  }

  return (
    <footer>
      {/* Closing call to action */}
      <div className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="aurora opacity-60" aria-hidden="true" />
        <div
          data-reveal
          className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 text-center md:py-28"
        >
          <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            One question. Five answers. No guesswork.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            Bring your own key, pick your models, and stop taking one AI&apos;s word for it.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="mt-8 h-11 px-6">
            Start comparing — free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Footer bar */}
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
          PentAI
        </Link>
        {/* No dynamic year: this page is statically prerendered, so a build-time
            year would disagree with the client's clock in a later year. */}
        <p className="text-sm text-muted-foreground">
          Built by <span className="font-medium text-foreground">Rishabh Jain</span>
        </p>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </footer>
  )
}
