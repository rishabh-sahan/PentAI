"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

const FAQS = [
  {
    question: "What does PentAI actually do?",
    answer:
      "You write one prompt and it goes to up to five AI models at the same time. Their answers appear in aligned columns on the same row, so you can compare them directly instead of opening five tabs and scrolling between them.",
  },
  {
    question: "Which models can I use?",
    answer:
      "Google's Gemini models, every free model OpenRouter currently offers, and Sarvam's models including the open-weight ones they host. The lists are fetched live rather than hardcoded, so they always reflect what is actually available right now — those rosters change often.",
  },
  {
    question: "Do I need to pay for anything?",
    answer:
      "No. OpenRouter's free models cost nothing to call, and Gemini has a free tier. You do need your own API keys, which are free to create — there is no PentAI subscription.",
  },
  {
    question: "Where are my API keys stored?",
    answer:
      "In your browser's local storage, on your device. They are attached to your own requests and nothing else. The server keeps no keys of its own, so nobody else's traffic can ever be billed to yours.",
  },
  {
    question: "Why do I sometimes hit a rate limit?",
    answer:
      "OpenRouter caps its free tier at roughly 20 requests per minute shared across all free models, with a daily cap too. Because every prompt calls all your selected models at once, five free models means five requests per message — which reaches that cap quickly.",
  },
  {
    question: "Are my conversations saved?",
    answer:
      "Yes, in your browser. Threads can be renamed, pinned and deleted, and the models you picked are remembered between visits. Nothing is written to a server database.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div data-reveal>
            <p className="text-base font-semibold uppercase tracking-[0.12em] text-primary md:text-lg">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Questions, answered.
            </h2>
          </div>

          <div data-reveal data-reveal-delay="80" className="divide-y divide-border border-t border-border">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left"
                  >
                    <span className="text-[15px] font-medium text-foreground">{faq.question}</span>
                    <Plus
                      className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 pr-10 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
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
