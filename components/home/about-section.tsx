"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"

export function AboutSection() {
  return (
    <section id="about" className="w-full max-w-[1320px] mx-auto px-5 mt-12 md:mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-stretch">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight mb-3">What is PentAI?</h2>
            <p className="text-muted-foreground leading-relaxed">
              PentAI is a premium AI workspace that unifies multiple leading models in a single, elegant interface. 
              Switch between models instantly, keep conversations organized, and focus on outcomes — not tabs.
            </p>
            <ul className="mt-5 space-y-3 text-sm md:text-base">
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary/70"/> Unified access to GPT, Claude, Gemini (and more)</li>
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary/70"/> Thoughtfully designed UI with fast, polished interactions</li>
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary/70"/> Privacy‑first approach; transparent settings and controls</li>
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary/70"/> Built with modern Web tooling for reliability and speed</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-semibold mb-3">Why we built it</h3>
            <p className="text-muted-foreground leading-relaxed">
              Great tools should feel invisible. PentAI eliminates switching costs and helps you get from idea to result
              with the least friction. It’s for developers, creators, and researchers who value both power and taste.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-border p-4">
                <div className="text-2xl font-semibold">1</div>
                <div className="text-muted-foreground mt-1">Refined UX</div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-2xl font-semibold">2</div>
                <div className="text-muted-foreground mt-1">Unified Models</div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-2xl font-semibold">3</div>
                <div className="text-muted-foreground mt-1">Privacy‑first</div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-2xl font-semibold">4</div>
                <div className="text-muted-foreground mt-1">Fast & Reliable</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}


