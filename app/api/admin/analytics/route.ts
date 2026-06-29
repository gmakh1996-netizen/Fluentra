import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

// Admin-only aggregate metrics for the analytics dashboard.
export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const [{ count: totalUsers }, { count: activeSubs }] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

    return NextResponse.json({
      totalUsers: totalUsers ?? 0,
      activeSubscriptions: activeSubs ?? 0,
      // Revenue/retention/AI-usage series are added in Phase 7 alongside their tables.
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
