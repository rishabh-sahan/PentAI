"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Code2, PenTool, Search } from "lucide-react"

export function UseCasesSection() {
  const cases = [
    {
      title: "Coding Assistant",
      description: "Generate, refactor, and explain code with multi‑model depth.",
      icon: Code2,
    },
    {
      title: "Content & Copy",
      description: "Write high‑quality drafts, summaries, and messaging faster.",
      icon: PenTool,
    },
    {
      title: "Research & Ideas",
      description: "Synthesize sources, explore approaches, and validate concepts.",
      icon: Search,
    },
  ]

  return (
    <section id="use-cases" className="w-full max-w-[1320px] mx-auto px-5 mt-12 md:mt-16">
      <h2 className="text-center text-2xl md:text-4xl font-semibold tracking-tight mb-6">Made for real work</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {cases.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.title} className="border-border/60 bg-card/60">
              <CardContent className="p-6">
                <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}


