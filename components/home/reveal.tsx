"use client"

import { useEffect } from "react"

/*
  Releases every [data-reveal] element on the page as it scrolls into view by
  setting data-visible="true"; the transition itself lives in globals.css.

  Mounted once at the page level rather than per-section so there is a single
  observer for the whole document. Elements are unobserved after firing, so
  nothing re-animates on scroll-up.
*/
export function RevealOnScroll() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))
    if (nodes.length === 0) return

    // Without IntersectionObserver, or with reduced motion, show everything.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.setAttribute("data-visible", "true"))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          // Stagger siblings so a row of cards cascades instead of popping.
          const delay = Number(el.dataset.revealDelay ?? 0)
          window.setTimeout(() => el.setAttribute("data-visible", "true"), delay)
          observer.unobserve(el)
        })
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    )

    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [])

  return null
}
