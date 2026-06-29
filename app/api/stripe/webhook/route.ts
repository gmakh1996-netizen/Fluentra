import Stripe from "stripe";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Stripe webhook. NEVER trust the client for subscription state — this handler
 * is the only writer of the `subscriptions` table and of profiles.subscription_tier.
 * The raw body is required for signature verification, so we read req.text().
 */
export async function POST(req: Request) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 501 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      // Map the Stripe price → our tier (Phase 4 fills the lookup); persist
      // status, period end, cancel flag against the user via metadata/customer.
      // Full reconciliation logic + tier→limit propagation lands in Phase 4.
      await admin.from("subscriptions").upsert(
        {
          stripe_subscription_id: sub.id,
          stripe_customer_id: String(sub.customer),
          status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        },
        { onConflict: "stripe_subscription_id" },
      );
      break;
    }
    default:
      // Acknowledge unhandled events so Stripe stops retrying.
      break;
  }

  return NextResponse.json({ received: true });
}
