"use client"

import React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export function ShowcaseSection() {
  return (
    <section className="w-full max-w-[1320px] mx-auto px-5 mt-10 md:mt-16">
      <Card className="overflow-hidden border-border/60 bg-card/60">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
                A workspace that feels premium
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Balanced contrast, beautiful typography, and polished components. Designed to stay out of your way
                while you think, create, and iterate.
              </p>
            </div>
            <div className="relative min-h-[240px] md:min-h-[360px]">
              <Image
                src="/images/product-ui.jpeg"
                alt="PentAI product preview"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}


