"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Braces, FileText, Lightbulb, SearchCheck } from "lucide-react"

const useCases = [
  {
    title: "Code decisions",
    description: "Ask multiple models for a refactor, compare risk, then keep the cleanest patch direction.",
    icon: Braces,
  },
  {
    title: "Research synthesis",
    description: "Use one model for breadth and another for critique before committing to an answer.",
    icon: SearchCheck,
  },
  {
    title: "Content drafts",
    description: "Compare tone, structure, and clarity across models without rewriting prompts in five tabs.",
    icon: FileText,
  },
  {
    title: "Idea pressure testing",
    description: "Let models disagree productively so your final plan is sharper.",
    icon: Lightbulb,
  },
]

export function UseCasesSection() {
  return (
    <section id="use-cases" className="mx-auto w-full max-w-[1320px] px-5 py-16 md:py-24">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-primary">Use cases</div>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
            Useful when one answer is not enough.
          </h2>
        </div>
        <p className="max-w-md text-muted-foreground">
          PentAI is strongest when you want judgment, not just generation.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {useCases.map((useCase) => {
          const Icon = useCase.icon
          return (
            <Card key={useCase.title} className="rounded-lg border-border/70 bg-card/70 py-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-semibold">{useCase.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{useCase.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
