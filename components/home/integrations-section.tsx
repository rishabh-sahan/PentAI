"use client"

import React from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export function IntegrationsSection() {
  const techLogos = [
    { src: "/images/mcp-integrations/nextjs.svg", alt: "Next.js" },
    { src: "/images/mcp-integrations/react.svg", alt: "React" },
    { src: "/images/mcp-integrations/shadcn.svg", alt: "shadcn/ui" },
    { src: "/images/mcp-integrations/tailwind-css.svg", alt: "Tailwind CSS" },
    { src: "/images/mcp-integrations/resend.svg", alt: "Resend" },
  ]

  const modelBadges = ["OpenAI", "Anthropic", "Google Gemini"]

  return (
    <section id="integrations" className="w-full max-w-[1320px] mx-auto px-5 mt-12 md:mt-16">
      <div className="text-center mb-6">
        <Badge variant="secondary" className="px-3 py-1 rounded-full">Built on a modern stack</Badge>
        <h2 className="mt-4 text-2xl md:text-4xl font-semibold tracking-tight">Beautiful UI, solid engineering</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          PentAI blends premium design with dependable tooling for a smooth, fast experience.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {techLogos.map((logo) => (
          <div key={logo.alt} className="relative h-8 w-24 md:h-9 md:w-28 opacity-80">
            <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        {modelBadges.map((m) => (
          <span key={m} className="px-3 py-1 rounded-full border border-border/70 text-sm bg-secondary/50">
            {m}
          </span>
        ))}
      </div>
    </section>
  )
}


