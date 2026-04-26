import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { ShowcaseSection } from "@/components/home/showcase-section"
import { AboutSection } from "@/components/home/about-section"
import { HowItWorksSection } from "@/components/home/how-it-works"
import { IntegrationsSection } from "@/components/home/integrations-section"
import { UseCasesSection } from "@/components/home/use-cases-section"
import { FAQSection } from "@/components/home/faq-section"
import { CTASection } from "@/components/home/cta-section"
import { FooterSection } from "@/components/home/footer-section"
import { AnimatedSection } from "@/components/home/animated-section"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-0 text-foreground">
      <div className="relative z-10">
        <main className="relative">
          <HeroSection />
        </main>
        <AnimatedSection className="relative z-10" delay={0.08}>
          <FeaturesSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10" delay={0.08}>
          <ShowcaseSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10" delay={0.08}>
          <AboutSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10" delay={0.08}>
          <HowItWorksSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10" delay={0.08}>
          <IntegrationsSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10" delay={0.08}>
          <UseCasesSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10" delay={0.08}>
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10" delay={0.08}>
          <CTASection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10" delay={0.08}>
          <FooterSection />
        </AnimatedSection>
      </div>
    </div>
  )
}
