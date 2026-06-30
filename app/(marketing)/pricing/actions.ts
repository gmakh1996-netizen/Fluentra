"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getStripe, getOrCreateCustomer } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import { PLANS } from "@/config/plans";

export async function startCheckout(tier: "pro" | "ultimate", interval: "monthly" | "yearly") {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect(`/login?next=/pricing`);
  }

  const plan = PLANS[tier];
  const priceId = interval === "yearly" ? plan.priceIds.yearly : plan.priceIds.monthly;

  if (!priceId) {
    redirect(`/register?plan=${tier}`);
  }

  const stripe = getStripe();
  const admin = createAdminClient();
  const customerId = await getOrCreateCustomer(stripe, user.id, user.email!, admin);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    metadata: { userId: user.id },
    subscription_data: {
      metadata: { userId: user.id },
      ...(plan.trialDays ? { trial_period_days: plan.trialDays } : {}),
    },
    allow_promotion_codes: true,
    success_url: `${siteConfig.url}/billing?status=success`,
    cancel_url: `${siteConfig.url}/pricing?status=cancelled`,
  });

  if (!session.url) redirect(`/pricing?status=error`);
  redirect(session.url);
}
