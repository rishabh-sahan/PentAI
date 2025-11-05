import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { ShowcaseSection } from "@/components/home/showcase-section"
import { AboutSection } from "@/components/home/about-section"
import { HowItWorksSection } from "@/components/home/how-it-works"
import { IntegrationsSection } from "@/components/home/integrations-section"
import { UseCasesSection } from "@/components/home/use-cases-section"
import { PricingSection } from "@/components/home/pricing-section"
import { FAQSection } from "@/components/home/faq-section"
import { CTASection } from "@/components/home/cta-section"
import { FooterSection } from "@/components/home/footer-section"
import { AnimatedSection } from "@/components/home/animated-section"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-0">
      <div className="relative z-10">
        <main className="max-w-[1320px] mx-auto relative">
          <HeroSection />
        </main>
        <AnimatedSection id="features" className="relative z-10 max-w-[1320px] mx-auto" delay={0.12}>
          <FeaturesSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto" delay={0.14}>
          <ShowcaseSection />
        </AnimatedSection>
        <AnimatedSection id="about" className="relative z-10 max-w-[1320px] mx-auto" delay={0.16}>
          <AboutSection />
        </AnimatedSection>
        <AnimatedSection id="how-it-works" className="relative z-10 max-w-[1320px] mx-auto" delay={0.18}>
          <HowItWorksSection />
        </AnimatedSection>
        <AnimatedSection id="integrations" className="relative z-10 max-w-[1320px] mx-auto" delay={0.2}>
          <IntegrationsSection />
        </AnimatedSection>
        <AnimatedSection id="use-cases" className="relative z-10 max-w-[1320px] mx-auto" delay={0.22}>
          <UseCasesSection />
        </AnimatedSection>
        {/* <AnimatedSection
          id="pricing-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-44 md:mt-64"
          delay={0.2}
        >
          <PricingSection />
        </AnimatedSection> */}
        <AnimatedSection id="faq-section" className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-10" delay={0.2}>
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-6 md:mt-8" delay={0.2}>
          <CTASection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-6 md:mt-8" delay={0.2}>
          <FooterSection />
        </AnimatedSection>
      </div>
    </div>
  )
}
