"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Shield, Zap } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      title: "Unified Models",
      description:
        "Access GPT, Claude, Gemini and more in one seamless interface designed for focus.",
      icon: Sparkles,
    },
    {
      title: "Private by Default",
      description:
        "Your data stays yours. Local controls and transparent settings built‑in.",
      icon: Shield,
    },
    {
      title: "Blazing Performance",
      description:
        "Fast interactions with polished UX. Minimal, thoughtful animations and feedback.",
      icon: Zap,
    },
  ]

  return (
    <section id="features" className="w-full max-w-[1320px] mx-auto px-5 mt-12 md:mt-16">
      <div className="text-center mb-6 md:mb-8">
        <Badge variant="secondary" className="px-3 py-1 rounded-full">Why PentAI</Badge>
        <h2 className="mt-4 text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
          A refined toolkit for everyday creation
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Thoughtfully designed surfaces and controls that feel premium — in light and dark.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {features.map((f) => {
          const Icon = f.icon
          return (
            <Card key={f.title} className="border-border/60 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}


