import Stripe from "stripe";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await requireUser();
    if (!env.STRIPE_SECRET_KEY) {
      throw new ApiError("provider_not_configured", "Billing is not configured.", 501);
    }
    const admin = createAdminClient();
    const { data } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!data?.stripe_customer_id) {
      throw new ApiError("not_found", "No billing account yet.", 404);
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${siteConfig.url}/billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return toErrorResponse(err);
  }
}
