import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/marketing/hero";
import { TrustedBy } from "@/components/marketing/trusted-by";

// Below-fold sections: code-split so framer-motion JS is deferred past LCP.
const Stats        = dynamic(() => import("@/components/marketing/stats").then(m => ({ default: m.Stats })));
const Features     = dynamic(() => import("@/components/marketing/features").then(m => ({ default: m.Features })));
const HowItWorks   = dynamic(() => import("@/components/marketing/how-it-works").then(m => ({ default: m.HowItWorks })));
const Languages    = dynamic(() => import("@/components/marketing/languages").then(m => ({ default: m.Languages })));
const Testimonials = dynamic(() => import("@/components/marketing/testimonials").then(m => ({ default: m.Testimonials })));
const PricingPreview = dynamic(() => import("@/components/marketing/pricing-preview").then(m => ({ default: m.PricingPreview })));
const Faq          = dynamic(() => import("@/components/marketing/faq").then(m => ({ default: m.Faq })));
const CtaBand      = dynamic(() => import("@/components/marketing/cta-band").then(m => ({ default: m.CtaBand })));

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
