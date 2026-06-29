"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PLANS, TIER_ORDER, type Tier } from "@/config/plans";
import { routes } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { cn } from "@/lib/utils";

type Interval = "monthly" | "yearly";

/** Display pricing for the marketing preview (yearly shown as monthly equivalent). */
const PRICES: Record<Tier, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 12, yearly: 9 },
  ultimate: { monthly: 24, yearly: 19 },
};

const HIGHLIGHT: Tier = "pro";

function IntervalToggle({
  interval,
  setInterval,
}: {
  interval: Interval;
  setInterval: (i: Interval) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Billing interval"
      className="relative inline-flex items-center rounded-full border bg-card p-1 shadow-xs"
    >
      {(["monthly", "yearly"] as const).map((i) => {
        const active = interval === i;
        return (
          <button
            key={i}
            role="radio"
            aria-checked={active}
            onClick={() => setInterval(i)}
            className={cn(
              "relative z-10 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="interval-pill"
                className="absolute inset-0 -z-10 rounded-full bg-brand-gradient"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {i}
            {i === "yearly" && (
              <span className={cn("ml-1.5 text-xs", active ? "text-white/90" : "text-success")}>
                −25%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function PricingPreview() {
  const [interval, setInterval] = React.useState<Interval>("yearly");

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow="Simple pricing"
        title={<span id="pricing-heading">Start free. Upgrade when you’re ready.</span>}
        subtitle="No credit card to begin. Switch plans or cancel anytime from the billing portal."
      />

      <Reveal preset="fade" className="mt-8 flex justify-center">
        <IntervalToggle interval={interval} setInterval={setInterval} />
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
        {TIER_ORDER.map((tier, idx) => {
          const plan = PLANS[tier];
          const price = PRICES[tier][interval];
          const highlighted = tier === HIGHLIGHT;
          return (
            <Reveal key={tier} preset="fade-up" delay={idx * 0.05}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow",
                  highlighted
                    ? "border-primary/50 shadow-glow lg:-mt-4 lg:mb-4"
                    : "hover:shadow-md",
                )}
              >
                {highlighted && (
                  <Badge variant="gradient" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Sparkles /> Most popular
                  </Badge>
                )}
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold tracking-tight">${price}</span>
                  <span className="text-sm text-muted-foreground">
                    {price === 0 ? "forever" : "/ month"}
                  </span>
                </div>
                <p className="mt-1 h-4 text-xs text-muted-foreground">
                  {price > 0 && interval === "yearly" ? "billed annually" : " "}
                </p>

                <Button
                  asChild
                  size="lg"
                  variant={highlighted ? "gradient" : "outline"}
                  className="mt-6 w-full"
                >
                  <Link href={routes.register}>
                    {tier === "free" ? "Get started" : `Choose ${plan.name}`}
                  </Link>
                </Button>

                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal preset="fade" className="mt-8 text-center text-sm text-muted-foreground">
        Want the full breakdown?{" "}
        <Link href={routes.pricing} className="font-medium text-primary hover:text-accent">
          Compare all plans →
        </Link>
      </Reveal>
    </section>
  );
}
