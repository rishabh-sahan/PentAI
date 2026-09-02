import { Header } from "@/components/home/header"
import { HeroSection } from "@/components/home/hero-section"
import { ProviderLogos } from "@/components/home/provider-logos"
import { StatsSection } from "@/components/home/stats-section"
import { HowItWorksSection } from "@/components/home/how-it-works"
import { ShowcaseSection } from "@/components/home/showcase-section"
import { UseCasesSection } from "@/components/home/use-cases-section"
import { FAQSection } from "@/components/home/faq-section"
import { FooterSection } from "@/components/home/footer-section"
import { RevealOnScroll } from "@/components/home/reveal"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <RevealOnScroll />
      {/* Sits above <main> so nothing with overflow-hidden can trap its sticky. */}
      <Header />
      <main>
        <HeroSection />
        <ProviderLogos />
        <StatsSection />
        <HowItWorksSection />
        <ShowcaseSection />
        <UseCasesSection />
        <FAQSection />
      </main>
      <FooterSection />
    </div>
  )
}
