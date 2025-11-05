"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LogIn, MessageSquare, LayoutDashboard } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      title: "Login securely",
      description: "Authenticate to your workspace and keep your data private.",
      icon: LogIn,
    },
    {
      title: "Pick a model",
      description: "Choose GPT, Claude, Gemini and start creating in seconds.",
      icon: MessageSquare,
    },
    {
      title: "Work in your Dashboard",
      description: "Organize chats, iterate quickly, and stay in flow.",
      icon: LayoutDashboard,
    },
  ]

  return (
    <section id="how-it-works" className="w-full max-w-[1320px] mx-auto px-5 mt-12 md:mt-16">
      <h2 className="text-center text-2xl md:text-4xl font-semibold tracking-tight mb-6">How it works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {steps.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.title} className="border-border/60 bg-card/60">
              <CardContent className="p-6">
                <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}


