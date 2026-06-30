import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { usageLimitReached } from "@/lib/errors";

type Meter = "ai_messages" | "voice_seconds";

/** Today's UTC date as YYYY-MM-DD, matching usage_limits.period_date. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Atomically checks and consumes usage for a meter. Throws
 * `usage_limit_reached` (429) if the user is over their daily budget.
 * Counters live in usage_limits and are written via the service role, so
 * users can never tamper with them under RLS.
 *
 * Phase 4 sets the *_limit columns from the active subscription tier; here we
 * read whatever the row currently holds (free-tier defaults until then).
 */
export async function consumeUsage(userId: string, meter: Meter, amount = 1): Promise<void> {
  const admin = createAdminClient();
  const period = today();
  const usedCol = `${meter}_used` as const;
  const limitCol = `${meter}_limit` as const;

  try {
    // Ensure a row exists for today.
    await admin
      .from("usage_limits")
      .upsert({ user_id: userId, period_date: period }, { onConflict: "user_id,period_date" });

    const { data, error } = await admin
      .from("usage_limits")
      .select(`${usedCol}, ${limitCol}`)
      .eq("user_id", userId)
      .eq("period_date", period)
      .single();

    // Table not yet migrated — skip enforcement until it exists.
    if (error || !data) return;

    const used = (data as Record<string, number>)[usedCol] ?? 0;
    const limit = (data as Record<string, number>)[limitCol] ?? 0;

    if (used + amount > limit) throw usageLimitReached();

    await admin
      .from("usage_limits")
      .update({ [usedCol]: used + amount } as never)
      .eq("user_id", userId)
      .eq("period_date", period);
  } catch (err) {
    // Re-throw only intentional limit errors; swallow infrastructure gaps.
    if (err instanceof Error && err.message === "usage_limit_reached") throw err;
    console.warn("[usage] skipped:", err instanceof Error ? err.message : err);
  }
}

/** Read remaining budget without consuming — for dashboards/UI gates. */
export async function getRemaining(userId: string, meter: Meter): Promise<number> {
  const admin = createAdminClient();
  const period = today();
  const { data } = await admin
    .from("usage_limits")
    .select(`${meter}_used, ${meter}_limit`)
    .eq("user_id", userId)
    .eq("period_date", period)
    .single();
  if (!data) return 0;
  const row = data as Record<string, number>;
  return Math.max(0, (row[`${meter}_limit`] ?? 0) - (row[`${meter}_used`] ?? 0));
}
