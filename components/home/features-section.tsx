"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GitCompareArrows, KeyRound, MessageSquareText, Pin, RefreshCw, Settings2 } from "lucide-react"

const features = [
  {
    title: "Parallel model replies",
    description: "Send one prompt and compare multiple responses in aligned columns.",
    icon: GitCompareArrows,
  },
  {
    title: "Bring your own keys",
    description: "OpenRouter and Gemini keys are saved locally and used only for your requests.",
    icon: KeyRound,
  },
  {
    title: "Live OpenRouter catalog",
    description: "Refresh available models and hide unavailable options automatically.",
    icon: RefreshCw,
  },
  {
    title: "Threaded workspace",
    description: "Create, rename, pin, and delete chats without leaving the dashboard.",
    icon: Pin,
  },
  {
    title: "Model controls",
    description: "Select up to five models, group free and paid options, and change anytime.",
    icon: Settings2,
  },
  {
    title: "Markdown answers",
    description: "Readable code blocks, inline code, emphasis, and copy actions are built in.",
    icon: MessageSquareText,
  },
]

export function FeaturesSection() {
  return (
    <section id="compare" className="mx-auto w-full max-w-[1320px] px-5 py-16 md:py-24">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <Badge variant="secondary" className="rounded-md px-3 py-1">Built for comparison</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            One prompt, multiple perspectives, cleaner decisions.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            PentAI is not a generic chat wrapper. It is a comparison desk for choosing the strongest answer, fastest draft, or clearest explanation from the models you already use.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="rounded-lg border-border/70 bg-card/70 py-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
