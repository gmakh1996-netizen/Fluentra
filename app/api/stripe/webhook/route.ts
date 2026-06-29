import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStripe, tierFromPriceId, syncTierToProfile, userIdFromCustomer } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Stripe sends the raw body for signature verification — never parse with Next.js body parsers.
export async function POST(req: Request) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 501 });
  }

  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      // ── Checkout completed: establish customer ↔ user link ──────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.userId;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (!userId || !customerId) break;

        await admin.from("subscriptions").upsert(
          { user_id: userId, stripe_customer_id: customerId, status: "active" },
          { onConflict: "user_id" },
        );
        break;
      }

      // ── Subscription lifecycle ───────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const userId = await userIdFromCustomer(stripe, customerId);
        if (!userId) break;

        const priceId = sub.items.data[0]?.price.id ?? null;
        const tier = (priceId ? tierFromPriceId(priceId) : null) ?? "free";
        const couponId = (sub.discount?.coupon?.id) ?? null;

        await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            stripe_price_id: priceId,
            tier,
            status: sub.status,
            trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
            coupon_id: couponId,
          },
          { onConflict: "user_id" },
        );

        // Sync tier to profile + usage limits when status is active or trialing
        if (sub.status === "active" || sub.status === "trialing") {
          await syncTierToProfile(userId, tier, admin);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const userId = await userIdFromCustomer(stripe, customerId);
        if (!userId) break;

        await admin.from("subscriptions").update({
          stripe_subscription_id: sub.id,
          tier: "free",
          status: "canceled",
          cancel_at_period_end: false,
        }).eq("user_id", userId);

        await syncTierToProfile(userId, "free", admin);
        break;
      }

      // ── Payment events ───────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;
        const userId = await userIdFromCustomer(stripe, customerId);
        if (!userId) break;

        await admin.from("subscriptions").update({ status: "past_due" }).eq("user_id", userId);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        const userId = await userIdFromCustomer(stripe, customerId);
        if (!userId) break;

        // Restore active status if it was past_due
        await admin
          .from("subscriptions")
          .update({ status: "active" })
          .eq("user_id", userId)
          .eq("status", "past_due");
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Log but don't return 500 — Stripe would retry, causing duplicate processing
    console.error(`Webhook handler error for ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}
