"use client"

import Image from "next/image"

const stack = [
  { src: "/images/mcp-integrations/nextjs.svg", alt: "Next.js" },
  { src: "/images/mcp-integrations/react.svg", alt: "React" },
  { src: "/images/mcp-integrations/tailwind-css.svg", alt: "Tailwind CSS" },
  { src: "/images/mcp-integrations/shadcn.svg", alt: "shadcn/ui" },
]

const providers = ["Gemini", "OpenRouter", "Llama", "Qwen", "GLM", "GPT OSS"]

export function IntegrationsSection() {
  return (
    <section className="mx-auto w-full max-w-[1320px] px-5 py-14 md:py-20">
      <div className="rounded-lg border border-border bg-card/70 p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-primary">Models and stack</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">
              Built with the stack already powering the app.
            </h2>
            <p className="mt-3 text-muted-foreground">
              The homepage now mirrors the actual implementation: Next.js, React, Tailwind, shadcn-style components, Supabase auth, Gemini routes, and OpenRouter routes.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              {providers.map((provider) => (
                <span key={provider} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                  {provider}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stack.map((item) => (
                <div key={item.alt} className="flex h-20 items-center justify-center rounded-lg border border-border bg-background/70 p-4">
                  <div className="relative h-8 w-24">
                    <Image src={item.src} alt={item.alt} fill className="object-contain dark:invert-[0.92]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
