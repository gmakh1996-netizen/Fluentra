import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
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
      .maybeSingle();

    if (!data?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] });
    }

    const stripe = getStripe();
    const list = await stripe.invoices.list({
      customer: data.stripe_customer_id,
      limit: 12,
      expand: ["data.discount"],
    });

    const invoices = list.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount: inv.amount_paid,
      currency: inv.currency,
      period_start: inv.period_start,
      period_end: inv.period_end,
      created: inv.created,
      pdf: inv.invoice_pdf,
      hosted: inv.hosted_invoice_url,
      discount: inv.discount?.coupon?.name ?? null,
    }));

    return NextResponse.json({ invoices });
  } catch (err) {
    return toErrorResponse(err);
  }
}
