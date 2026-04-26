"use client"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { LoginModal } from "@/components/auth/LoginModal"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export function CTASection() {
  const { session } = useAuth()
  const router = useRouter()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleGoToDashboard = () => {
    if (session) {
      router.push("/dashboard")
    } else {
      setIsLoginModalOpen(true)
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1320px] px-5 pb-8 pt-10 md:pb-12">
      <div className="rounded-lg border border-border bg-primary p-7 text-primary-foreground md:p-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
              Ready to compare your next answer?
            </h2>
            <p className="mt-3 max-w-xl text-primary-foreground/75">
              Open the dashboard, select models, add keys when needed, and let the best response win.
            </p>
          </div>
          <Button
            className="h-12 bg-primary-foreground px-6 text-base text-primary hover:bg-primary-foreground/90"
            size="lg"
            onClick={handleGoToDashboard}
          >
            Open dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </section>
  )
}
