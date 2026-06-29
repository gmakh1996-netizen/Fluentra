import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const today        = new Date().toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [
      { count: totalUsers },
      { count: newUsers7d },
      { count: activeSubs },
      { count: trialingSubs },
      { data: usageToday },
    ] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
      admin.from("usage_limits").select("ai_messages_used, voice_seconds_used").eq("period_date", today),
    ]);

    const aiMessagesToday  = (usageToday ?? []).reduce((s, r) => s + (r.ai_messages_used   ?? 0), 0);
    const voiceMinutesToday = Math.round((usageToday ?? []).reduce((s, r) => s + (r.voice_seconds_used ?? 0), 0) / 60);

    return NextResponse.json({
      totalUsers:             totalUsers  ?? 0,
      newUsers7d:             newUsers7d  ?? 0,
      activeSubscriptions:    activeSubs  ?? 0,
      trialingSubscriptions:  trialingSubs ?? 0,
      aiMessagesToday,
      voiceMinutesToday,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
