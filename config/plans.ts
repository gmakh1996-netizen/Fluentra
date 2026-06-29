import type { Database } from "@/types/database";

export type Tier = Database["public"]["Enums"]["subscription_tier"];

export interface PlanLimits {
  aiMessagesPerDay: number; // -1 = effectively unlimited (soft-capped server-side)
  voiceSecondsPerDay: number;
}

export interface Plan {
  tier: Tier;
  name: string;
  blurb: string;
  limits: PlanLimits;
  features: string[];
  /** Stripe price IDs by interval; null for the free plan. */
  priceIds: { monthly: string | null; yearly: string | null };
}

/**
 * Single source of truth for what each tier can do. lib/usage reads these
 * limits; the pricing page and gating logic both derive from this list so
 * they can never drift apart. "Unlimited" tiers still carry a high soft cap
 * to protect against abuse and runaway AI cost.
 */
export const SOFT_UNLIMITED = 2000;

export const PLANS: Record<Tier, Plan> = {
  free: {
    tier: "free",
    name: "Free",
    blurb: "Get started with daily practice.",
    limits: { aiMessagesPerDay: 10, voiceSecondsPerDay: 0 },
    features: ["10 AI messages/day", "Basic lessons", "Limited vocabulary"],
    priceIds: { monthly: null, yearly: null },
  },
  pro: {
    tier: "pro",
    name: "Pro",
    blurb: "Unlimited conversation and voice.",
    limits: { aiMessagesPerDay: SOFT_UNLIMITED, voiceSecondsPerDay: 1800 },
    features: [
      "Unlimited AI chat",
      "Voice conversation",
      "Grammar & writing coach",
      "Progress analytics",
    ],
    priceIds: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? null,
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? null,
    },
  },
  ultimate: {
    tier: "ultimate",
    name: "Ultimate",
    blurb: "Everything, plus advanced pronunciation.",
    limits: { aiMessagesPerDay: SOFT_UNLIMITED, voiceSecondsPerDay: 3600 },
    features: [
      "Everything in Pro",
      "Advanced pronunciation",
      "Personal AI plan",
      "Priority AI models",
      "Certificates",
    ],
    priceIds: {
      monthly: process.env.STRIPE_PRICE_ULTIMATE_MONTHLY ?? null,
      yearly: process.env.STRIPE_PRICE_ULTIMATE_YEARLY ?? null,
    },
  },
};

export const TIER_ORDER: Tier[] = ["free", "pro", "ultimate"];
