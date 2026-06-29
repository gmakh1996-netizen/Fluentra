import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { TrustedBy } from "@/components/marketing/trusted-by";
import { Stats } from "@/components/marketing/stats";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Languages } from "@/components/marketing/languages";
import { Testimonials } from "@/components/marketing/testimonials";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Learn languages with your personal AI tutor",
  description:
    "Fluentra is the premium AI language-learning platform: real voice conversations, instant pronunciation and grammar feedback, and adaptive daily lessons across 100+ languages.",
  openGraph: {
    title: "Fluentra — Speak the world with AI",
    description:
      "Hold real conversations by voice, get instant feedback, and follow adaptive daily lessons. Start free.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <Stats />
      <Features />
      <HowItWorks />
      <Languages />
      <Testimonials />
      <PricingPreview />
      <Faq />
      <CtaBand />
    </>
  );
}
