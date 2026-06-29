import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreditCard, TrendingUp, Clock, XCircle } from "lucide-react";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Subscriptions" };

function Stat({ title, value, sub, icon: Icon, cls }: {
  title: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>; cls: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-3xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-xl", cls)}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

const TIER_CLS: Record<string, string> = {
  free:     "bg-muted text-muted-foreground",
  pro:      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  ultimate: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
};
const STATUS_CLS: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  trialing: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  past_due: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  canceled: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  inactive: "bg-muted text-muted-foreground",
};

function fmtDate(ts: string | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminSubscriptionsPage() {
  const admin = createAdminClient();

  const [
    { count: active },
    { count: trialing },
    { count: canceled },
    { data: subs },
    authResult,
  ] = await Promise.all([
    admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
    admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "canceled"),
    admin.from("subscriptions")
      .select("user_id, tier, status, stripe_price_id, trial_end, current_period_end, cancel_at_period_end, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    admin.auth.admin.listUsers({ perPage: 500 }),
  ]);

  const emailMap = new Map((authResult.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const MRR_MAP: Record<string, number> = {
    [env.STRIPE_PRICE_PRO_MONTHLY      ?? ""]: 7.99,
    [env.STRIPE_PRICE_PRO_YEARLY       ?? ""]: 47.88 / 12,
    [env.STRIPE_PRICE_ULTIMATE_MONTHLY ?? ""]: 12.99,
    [env.STRIPE_PRICE_ULTIMATE_YEARLY  ?? ""]: 77.88 / 12,
  };
  const mrr = (subs ?? [])
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.stripe_price_id ? (MRR_MAP[s.stripe_price_id] ?? 0) : 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Billing overview and subscription list.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat title="Active"   value={active   ?? 0} icon={CreditCard} cls="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" />
        <Stat title="Trialing" value={trialing ?? 0} icon={Clock}      cls="bg-blue-100 dark:bg-blue-900/30 text-blue-600" />
        <Stat title="Canceled" value={canceled ?? 0} icon={XCircle}   cls="bg-red-100 dark:bg-red-900/30 text-red-600" />
        <Stat title="MRR" value={`$${mrr.toFixed(2)}`} sub="Active only" icon={TrendingUp} cls="bg-violet-100 dark:bg-violet-900/30 text-violet-600" />
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Trial ends</th>
              <th className="px-4 py-3 font-medium">Period end</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(subs ?? []).map((s) => (
              <tr key={s.user_id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {emailMap.get(s.user_id) ?? s.user_id.slice(0, 8) + "…"}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", TIER_CLS[s.tier] ?? TIER_CLS.free)}>
                    {s.tier}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_CLS[s.status] ?? STATUS_CLS.inactive)}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{fmtDate(s.trial_end)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                  {fmtDate(s.current_period_end)}
                  {s.cancel_at_period_end && <span className="ml-1 text-red-500">· cancels</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{fmtDate(s.created_at)}</td>
              </tr>
            ))}
            {!subs?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No subscriptions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
