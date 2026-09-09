const USE_CASES = [
  {
    tag: "For developers",
    title: "Choosing which model to build on",
    body: "Before you wire your app to one provider, run your real prompts through the candidates together and see which one handles your awkward cases.",
  },
  {
    tag: "For everyone",
    title: "Checking an answer that smells wrong",
    body: "When a model tells you something confidently and you're not convinced, ask four more. Agreement is a good sign; disagreement tells you to dig.",
  },
  {
    tag: "For writers",
    title: "Getting unstuck on a draft",
    body: "Different models open a piece in completely different ways. Read four first paragraphs at once and keep the one worth continuing.",
  },
  {
    tag: "For students",
    title: "Learning without paying",
    body: "Free models handle most everyday questions well. Compare them against a paid one and only spend where it actually makes a difference.",
  },
]

export function UseCasesSection() {
  return (
    <section id="use-cases" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-base font-semibold uppercase tracking-[0.12em] text-primary md:text-lg">Use cases</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            When a second opinion is the whole point.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2">
          {USE_CASES.map((item, i) => (
            <div
              key={item.title}
              data-reveal
              data-reveal-delay={(i % 2) * 90}
              className="hover-lift rounded-xl border border-border bg-card p-6 hover:border-primary/35 md:p-7"
            >
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                {item.tag}
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
