"use client"

import { Github } from "lucide-react"

const links = [
  { label: "Compare", href: "#compare" },
  { label: "Workflow", href: "#workflow" },
  { label: "Security", href: "#security" },
  { label: "Use cases", href: "#use-cases" },
  { label: "FAQ", href: "#faq-section" },
]

export function FooterSection() {
  return (
    <footer className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 border-t border-border px-5 py-8 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-xl font-semibold tracking-tight">PentAI</div>
        <p className="mt-1 text-sm text-muted-foreground">Open-source multi-model AI workspace.</p>
      </div>

      <nav className="flex flex-wrap gap-3">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            {link.label}
          </a>
        ))}
      </nav>

      <a href="#" aria-label="GitHub" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground">
        <Github className="h-4 w-4" />
      </a>
    </footer>
  )
}
