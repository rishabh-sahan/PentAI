/*
  Provider wordmarks are drawn inline rather than pulled from brand CDNs: it
  keeps the strip theme-aware (they inherit currentColor) and avoids shipping
  third-party brand assets. Google keeps its official colours since a
  monochrome "G" is not recognisable.
*/

function GeminiMark() {
  return (
    <span className="flex items-center gap-2.5">
      {/* Gemini's four-point spark, in its blue→violet brand gradient */}
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="geminiGrad" x1="2" y1="20" x2="22" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4796E3" />
            <stop offset="0.5" stopColor="#9177C7" />
            <stop offset="1" stopColor="#D96570" />
          </linearGradient>
        </defs>
        <path
          fill="url(#geminiGrad)"
          d="M12 1.5c.28 4.02 1.62 6.9 3.9 8.7 1.6 1.26 3.6 2.02 6.1 2.3v-1c-2.5.28-4.5 1.04-6.1 2.3-2.28 1.8-3.62 4.68-3.9 8.7-.28-4.02-1.62-6.9-3.9-8.7C6.5 12.54 4.5 11.78 2 11.5v1c2.5-.28 4.5-1.04 6.1-2.3C10.38 8.4 11.72 5.52 12 1.5Z"
        />
      </svg>
      <span className="text-base font-semibold tracking-tight">Gemini</span>
    </span>
  )
}

function OpenRouterMark() {
  return (
    <span className="flex items-center gap-2.5">
      {/* OpenRouter's mark: one request routed outward to many models */}
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true" fill="none">
        <path
          d="M2.5 12h4.2c1.5 0 2.3-.75 3.4-2.1 1.2-1.5 2.2-2.4 4-2.4h3.1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M2.5 12h4.2c1.5 0 2.3.75 3.4 2.1 1.2 1.5 2.2 2.4 4 2.4h3.1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M15.4 4.6 21.5 7.5l-6.1 2.9V4.6Z" fill="currentColor" />
        <path d="M15.4 13.6 21.5 16.5l-6.1 2.9v-5.8Z" fill="currentColor" />
      </svg>
      <span className="text-base font-semibold tracking-tight">OpenRouter</span>
    </span>
  )
}

function SarvamMark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true" fill="none">
        <path
          d="M12 2.5 21 7v10l-9 4.5L3 17V7l9-4.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M12 7.5v9M8.5 9.75v4.5M15.5 9.75v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-base font-semibold tracking-tight">Sarvam</span>
    </span>
  )
}

const PROVIDERS = [
  { key: "openrouter", node: <OpenRouterMark /> },
  { key: "gemini", node: <GeminiMark /> },
  { key: "sarvam", node: <SarvamMark /> },
]

export function ProviderLogos() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-16">
        <p
          data-reveal
          className="text-center text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground"
        >
          Every model from these providers, in one place
        </p>

        <div
          data-reveal
          className="mt-8 flex flex-wrap items-center justify-center gap-x-14 gap-y-8 text-foreground/85"
        >
          {PROVIDERS.map((p) => (
            <div
              key={p.key}
              className="transition-opacity duration-200 hover:opacity-100 opacity-80"
            >
              {p.node}
            </div>
          ))}
        </div>

        <p data-reveal className="mt-8 text-center text-sm text-muted-foreground">
          One prompt reaches all of them at once — no tab-switching, no copy-paste.
        </p>
      </div>
    </section>
  )
}
