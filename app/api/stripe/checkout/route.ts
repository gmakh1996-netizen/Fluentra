import Stripe from "stripe";
import { z } from "zod";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({ priceId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!env.STRIPE_SECRET_KEY) {
      throw new ApiError("provider_not_configured", "Billing is not configured.", 501);
    }
    const { priceId } = bodySchema.parse(await req.json());
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { userId: user.id },
      success_url: `${siteConfig.url}/billing?status=success`,
      cancel_url: `${siteConfig.url}/pricing?status=cancelled`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return toErrorResponse(err);
  }
}
