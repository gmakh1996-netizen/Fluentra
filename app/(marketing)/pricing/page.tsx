"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Star, Sparkles, ArrowRight } from "lucide-react";
import { PLANS, TIER_ORDER } from "@/config/plans";
import { cn } from "@/lib/utils";

const ICONS = { free: Zap, pro: Star, ultimate: Sparkles };
const DISPLAY_PRICES: Record<string, { monthly: number; yearly: number }> = {
  free:     { monthly: 0,     yearly: 0 },
  pro:      { monthly: 7.99,  yearly: 3.99 },  // $47.99/yr billed annually, save 50%
  ultimate: { monthly: 12.99, yearly: 6.50 },  // $77.99/yr billed annually, save 50%
};

export default function PricingPage() {
  const router = useRouter();
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  async function checkout(priceId: string, tier: string) {
    setLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      if (res.status === 401) { router.push(`/login?next=/pricing`); return; }
      const data = await res.json() as { url?: string; error?: { message: string } };
      if (data.url) window.location.href = data.url;
      else alert(data.error?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  function handleCta(tier: string, priceId: string | null) {
    if (tier === "free") {
      router.push("/register");
      return;
    }
    if (!priceId) {
      router.push(`/register?plan=${tier}`);
      return;
    }
    checkout(priceId, tier);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Pricing</p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Speak the world.<br className="hidden sm:block" /> Pick your plan.
        </h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Start free, upgrade when you're ready. Cancel anytime — no hidden fees.
        </p>
      </div>

      {/* Interval toggle */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted p-1 text-sm">
          {(["monthly", "yearly"] as const).map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={cn(
                "rounded-lg px-4 py-1.5 font-medium capitalize transition-all",
                interval === i ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {i}
              {i === "yearly" && (
                <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  save 50%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {TIER_ORDER.map((tier) => {
          const plan = PLANS[tier];
          const Icon = ICONS[tier];
          const priceId = interval === "yearly" ? plan.priceIds.yearly : plan.priceIds.monthly;
          const isPro = tier === "pro";
          const isUltimate = tier === "ultimate";

          const prices = DISPLAY_PRICES[tier] ?? { monthly: 0, yearly: 0 };
          const display = interval === "yearly" ? prices.yearly : prices.monthly;

          return (
            <div
              key={tier}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6",
                isPro
                  ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]"
                  : "border-border bg-card",
              )}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    Most popular
                  </span>
                </div>
              )}

              {/* Icon + name */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  isPro ? "bg-primary text-primary-foreground" :
                  isUltimate ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground",
                )}>
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.blurb}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-4xl font-bold tracking-tight">
                  ${display}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">
                  {tier === "free" ? "forever" : interval === "yearly"
                    ? <>/mo <span className="text-xs">billed ${tier === "pro" ? "47.99" : "77.99"}/yr</span></>
                    : "/mo"}
                </span>
              </div>

              {/* Trial badge */}
              {tier !== "free" && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  7-day free trial included
                </p>
              )}

              {/* CTA */}
              <button
                onClick={() => handleCta(tier, priceId)}
                disabled={loading === tier}
                className={cn(
                  "mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
                  tier === "free"
                    ? "border border-border hover:bg-muted"
                    : isPro
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    : "bg-violet-600 text-white hover:bg-violet-700",
                )}
              >
                {loading === tier ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : tier === "free" ? (
                  <>Get started free</>
                ) : (
                  <>Start free trial <ArrowRight className="size-3.5" /></>
                )}
              </button>

              {/* Features */}
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={cn("mt-0.5 size-4 shrink-0", isPro ? "text-primary" : isUltimate ? "text-violet-500" : "text-muted-foreground")} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        All plans include SSL, GDPR-compliant data handling, and 99.9% uptime. Prices in USD.
      </p>
    </div>
  );
}
