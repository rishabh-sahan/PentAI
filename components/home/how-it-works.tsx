"use client"

import { Card, CardContent } from "@/components/ui/card"
import { KeyRound, MessageSquarePlus, MousePointerClick, PanelsTopLeft } from "lucide-react"

const steps = [
  {
    title: "Sign in",
    description: "Start from the homepage and land in a persistent dashboard session.",
    icon: MousePointerClick,
  },
  {
    title: "Add keys",
    description: "Paste Gemini and OpenRouter keys into the settings modal when needed.",
    icon: KeyRound,
  },
  {
    title: "Choose models",
    description: "Pick up to five models from grouped free, paid, and Gemini sections.",
    icon: PanelsTopLeft,
  },
  {
    title: "Compare answers",
    description: "Ask once, review every model answer, then copy the best result.",
    icon: MessageSquarePlus,
  },
]

export function HowItWorksSection() {
  return (
    <section id="workflow" className="border-y border-border bg-card/35">
      <div className="mx-auto w-full max-w-[1320px] px-5 py-16 md:py-24">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wide text-primary">Workflow</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            From login to better answers in four moves.
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={step.title} className="rounded-lg border-border/70 bg-background/70 py-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
