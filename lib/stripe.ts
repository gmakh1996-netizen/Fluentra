import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { PLANS, type Tier } from "@/config/plans";
import type { SupabaseClient } from "@supabase/supabase-js";

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(env.STRIPE_SECRET_KEY);
}

/** Map a Stripe price ID back to our subscription tier. */
export function tierFromPriceId(priceId: string): Tier | null {
  for (const [tier, plan] of Object.entries(PLANS)) {
    if (plan.priceIds.monthly === priceId || plan.priceIds.yearly === priceId) {
      return tier as Tier;
    }
  }
  return null;
}

/** Look up an existing Stripe customer for the user, or create one and persist it. */
export async function getOrCreateCustomer(
  stripe: Stripe,
  userId: string,
  email: string,
  admin: SupabaseClient,
): Promise<string> {
  const { data } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (data?.stripe_customer_id) return data.stripe_customer_id;

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await admin.from("subscriptions").upsert(
    { user_id: userId, stripe_customer_id: customer.id, status: "inactive" },
    { onConflict: "user_id" },
  );

  return customer.id;
}

/** Sync profiles.subscription_tier + usage_limits after a tier change. */
export async function syncTierToProfile(
  userId: string,
  tier: Tier,
  admin: SupabaseClient,
): Promise<void> {
  await admin.from("profiles").update({ subscription_tier: tier }).eq("id", userId);

  const plan = PLANS[tier];
  const today = new Date().toISOString().slice(0, 10);

  await admin
    .from("usage_limits")
    .upsert(
      {
        user_id: userId,
        period_date: today,
        ai_messages_limit: plan.limits.aiMessagesPerDay,
        voice_seconds_limit: plan.limits.voiceSecondsPerDay,
      },
      { onConflict: "user_id,period_date" },
    )
    .select();
}

/** Look up the user_id from a Stripe customer's metadata. */
export async function userIdFromCustomer(
  stripe: Stripe,
  customerId: string,
): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return (customer as Stripe.Customer).metadata?.userId ?? null;
  } catch {
    return null;
  }
}
