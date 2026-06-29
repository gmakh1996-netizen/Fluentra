import { z } from "zod";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { getStripe, getOrCreateCustomer } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import { PLANS } from "@/config/plans";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  priceId: z.string().min(1),
  coupon: z.string().optional(),
});

function trialDaysForPrice(priceId: string): number | undefined {
  for (const plan of Object.values(PLANS)) {
    const p = plan as typeof plan & { trialDays?: number };
    if (p.priceIds.monthly === priceId || p.priceIds.yearly === priceId) {
      return p.trialDays;
    }
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!env.STRIPE_SECRET_KEY) {
      throw new ApiError("provider_not_configured", "Billing is not configured.", 501);
    }

    const { priceId, coupon } = bodySchema.parse(await req.json());
    const stripe = getStripe();
    const admin = createAdminClient();

    const customerId = await getOrCreateCustomer(stripe, user.id, user.email!, admin);
    const trialDays = trialDaysForPrice(priceId);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
        ...(trialDays ? { trial_period_days: trialDays } : {}),
        ...(coupon ? { coupon } : {}),
      },
      allow_promotion_codes: !coupon,
      success_url: `${siteConfig.url}/billing?status=success`,
      cancel_url: `${siteConfig.url}/pricing?status=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return toErrorResponse(err);
  }
}
