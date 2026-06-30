import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free, upgrade when you're ready. Fluentra plans from $0 — unlimited AI conversation, voice coaching, and pronunciation scoring.",
  openGraph: {
    title: "Pricing · Fluentra",
    description:
      "Start free, upgrade when you're ready. Plans built for every learner, from casual practice to intensive fluency.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
