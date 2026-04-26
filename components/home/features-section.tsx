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
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <Badge variant="secondary" className="rounded-md px-3 py-1">Built for comparison</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            One prompt, multiple perspectives, cleaner decisions.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            PentAI is not a generic chat wrapper. It is a comparison desk for choosing the strongest answer, fastest draft, or clearest explanation from the models you already use.
          </p>

          {/* Mini highlights to fill the space */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { value: "5", label: "Parallel models" },
              { value: "0", label: "Data stored on server" },
              { value: "∞", label: "Chats & threads" },
            ].map((stat) => (
              <div key={stat.label} className="text-center rounded-lg border border-border/50 bg-card/50 px-3 py-4">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500"].map((bg, i) => (
                <div key={i} className={`h-7 w-7 rounded-full ${bg} border-2 border-background flex items-center justify-center`}>
                  <span className="text-[10px] font-bold text-white">{["G", "L", "Q", "M"][i]}</span>
                </div>
              ))}
            </div>
            <span>Works with Gemini, Llama, Qwen, Mistral & more</span>
          </div>
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
