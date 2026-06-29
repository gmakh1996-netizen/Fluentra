import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";

function toCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const type = new URL(req.url).searchParams.get("type");
    const admin = createAdminClient();

    if (type === "users") {
      const [authResult, { data: profiles }] = await Promise.all([
        admin.auth.admin.listUsers({ perPage: 1000 }),
        admin.from("profiles").select("id, display_name, role, subscription_tier, onboarded, created_at"),
      ]);
      const pm = new Map((profiles ?? []).map((p) => [p.id, p]));
      const rows = (authResult.data?.users ?? []).map((u) => [
        u.id, u.email ?? "",
        pm.get(u.id)?.display_name ?? "",
        pm.get(u.id)?.role ?? "user",
        pm.get(u.id)?.subscription_tier ?? "free",
        pm.get(u.id)?.onboarded ? "true" : "false",
        u.created_at,
        u.last_sign_in_at ?? "",
      ]);
      const csv = toCsv(
        ["id", "email", "display_name", "role", "tier", "onboarded", "created_at", "last_sign_in"],
        rows,
      );
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="users.csv"',
        },
      });
    }

    if (type === "subscriptions") {
      const { data: subs } = await admin
        .from("subscriptions")
        .select("user_id, tier, status, stripe_customer_id, stripe_subscription_id, stripe_price_id, trial_end, current_period_end, cancel_at_period_end, coupon_id, created_at");
      const rows = (subs ?? []).map((s) => [
        s.user_id, s.tier, s.status,
        s.stripe_customer_id, s.stripe_subscription_id ?? "", s.stripe_price_id ?? "",
        s.trial_end ?? "", s.current_period_end ?? "", s.cancel_at_period_end, s.coupon_id ?? "",
        s.created_at,
      ]);
      const csv = toCsv(
        ["user_id", "tier", "status", "stripe_customer_id", "stripe_subscription_id", "stripe_price_id", "trial_end", "current_period_end", "cancel_at_period_end", "coupon_id", "created_at"],
        rows,
      );
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="subscriptions.csv"',
        },
      });
    }

    if (type === "usage") {
      const { data: usage } = await admin
        .from("usage_limits")
        .select("user_id, period_date, ai_messages_used, ai_messages_limit, voice_seconds_used, voice_seconds_limit")
        .order("period_date", { ascending: false })
        .limit(10000);
      const rows = (usage ?? []).map((u) => [
        u.user_id, u.period_date,
        u.ai_messages_used, u.ai_messages_limit,
        u.voice_seconds_used, u.voice_seconds_limit,
      ]);
      const csv = toCsv(
        ["user_id", "period_date", "ai_messages_used", "ai_messages_limit", "voice_seconds_used", "voice_seconds_limit"],
        rows,
      );
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="usage.csv"',
        },
      });
    }

    throw new ApiError("not_found", "Unknown report type. Use type=users|subscriptions|usage.", 400);
  } catch (err) {
    return toErrorResponse(err);
  }
}
