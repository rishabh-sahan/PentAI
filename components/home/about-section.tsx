"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Database, Eye, LockKeyhole, Server } from "lucide-react"

const principles = [
  {
    title: "Local key storage",
    body: "API keys are kept in browser localStorage and sent only when making your model requests.",
    icon: LockKeyhole,
  },
  {
    title: "Transparent providers",
    body: "Gemini and OpenRouter are separated clearly so users know which key and account each model uses.",
    icon: Server,
  },
  {
    title: "No hidden model magic",
    body: "Free, paid, pro, and special model labels are visible in the selector and comparison row.",
    icon: Eye,
  },
  {
    title: "Persistent workspace",
    body: "Selected models, chat threads, pinned chats, and active sessions stay ready between visits.",
    icon: Database,
  },
]

export function AboutSection() {
  return (
    <section id="security" className="mx-auto w-full max-w-[1320px] px-5 py-16 md:py-24">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-primary">Privacy by design</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            A BYOK workspace that stays honest about what it is doing.
          </h2>
          <p className="mt-4 text-muted-foreground">
            PentAI is designed for users who want control. It does not pretend every provider is the same, and it keeps the important model and key decisions visible.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {principles.map((principle) => {
            const Icon = principle.icon
            return (
              <Card key={principle.title} className="rounded-lg border-border/70 bg-card/70 py-0 shadow-sm">
                <CardContent className="p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 font-semibold">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{principle.body}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
