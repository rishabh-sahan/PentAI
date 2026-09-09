import { KeyRound, ListChecks, MessagesSquare } from "lucide-react"

const STEPS = [
  {
    icon: KeyRound,
    step: "01",
    title: "Paste a key",
    body: "Grab a free API key from OpenRouter, Google or Sarvam and paste it into Settings. It stays in your browser — we never see it.",
  },
  {
    icon: ListChecks,
    step: "02",
    title: "Pick your models",
    body: "Browse every model each provider offers, filtered by provider, and tick up to five. Swap them any time without losing your chat.",
  },
  {
    icon: MessagesSquare,
    step: "03",
    title: "Ask once, read across",
    body: "Type your question. All five answer at the same time, in neat columns — so the best answer is easy to spot.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-base font-semibold uppercase tracking-[0.12em] text-primary md:text-lg">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Up and running in about a minute.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            No setup, no install, no credit card. Three steps and you&apos;re comparing.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3">
          {STEPS.map((item, i) => (
            <div
              key={item.step}
              data-reveal
              data-reveal-delay={i * 90}
              className="hover-lift rounded-xl border border-border bg-card p-6 hover:border-primary/35 md:p-7"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">{item.step}</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
