"use client"

import Image from "next/image"
import { CheckCircle2, Copy, Rows3 } from "lucide-react"

export function ShowcaseSection() {
  return (
    <section className="border-y border-border bg-card/35">
      <div className="mx-auto grid w-full max-w-[1320px] gap-8 px-5 py-16 md:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-xl shadow-foreground/10">
            <Image
              src="/images/product-ui.jpeg"
              alt="PentAI dashboard preview"
              width={1100}
              height={760}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="text-sm font-semibold uppercase tracking-wide text-primary">Dashboard first</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            The homepage now points to the product you actually built.
          </h2>
          <p className="mt-4 text-muted-foreground">
            The core experience is the dashboard: a sidebar for chat history, a top row for selected models, a comparison grid for answers, and a fixed input that stays ready while you work.
          </p>

          <div className="mt-7 grid gap-3">
            {[
              { icon: Rows3, title: "Aligned answer columns", body: "Each selected model responds in its own lane for fast scanning." },
              { icon: Copy, title: "Copy individual or grouped results", body: "Grab one response or combine every model answer for a prompt." },
              { icon: CheckCircle2, title: "Works across light and dark", body: "Shared tokens keep surfaces, borders, text, and badges consistent." },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-lg border border-border bg-background/70 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
