import { Columns3, KeyRound, Zap, MessagesSquare, Layers, ImageIcon } from "lucide-react"

const CAPABILITIES = [
  {
    icon: Columns3,
    title: "Answers line up",
    body: "Every reply to the same question sits in its own column on one row. Differences jump out instead of hiding in five separate tabs.",
  },
  {
    icon: Zap,
    title: "All at the same time",
    body: "Models are asked together, not one after another. You wait for the slowest one — not for all five added up.",
  },
  {
    icon: Layers,
    title: "Always-current model list",
    body: "Free models come and go every week. PentAI reads the live list each time you open it, so you never pick one that's already gone.",
  },
  {
    icon: KeyRound,
    title: "Your keys stay yours",
    body: "Keys are saved in your browser and sent straight to the provider. Our server keeps none of its own, so your usage is only ever yours.",
  },
  {
    icon: MessagesSquare,
    title: "Chats you can come back to",
    body: "Rename, pin and delete conversations. The comparison you ran last week is still there when you need to point at it.",
  },
  {
    icon: ImageIcon,
    title: "Ask about a picture",
    body: "Attach an image to your question and Gemini models will read it — handy for screenshots, diagrams and error messages.",
  },
]

export function ShowcaseSection() {
  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-base font-semibold uppercase tracking-[0.12em] text-primary md:text-lg">Why it&apos;s useful</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Built for judging answers, not collecting them.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {CAPABILITIES.map((item, i) => (
            <div
              key={item.title}
              data-reveal
              data-reveal-delay={(i % 3) * 80}
              className="hover-lift rounded-xl border border-border bg-card p-6 hover:border-primary/35"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 text-base font-medium text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
