import type { Metadata } from "next";
import Link from "next/link";
import { Users, CreditCard, Zap, TrendingUp } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserGrowthChart, UsageChart, TierPieChart } from "@/components/admin/overview-charts";
import { env } from "@/lib/env";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

function StatCard({
  title, value, subtitle, icon: Icon, color, href,
}: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ComponentType<{ className?: string }>; color: string; href?: string;
}) {
  const inner = (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className={cn("flex size-10 items-center justify-center rounded-xl", color)}>
        <Icon className="size-5" />
      </div>
    </div>
  );
  const cls = cn("rounded-2xl border bg-card p-5 shadow-sm", href && "cursor-pointer transition-shadow hover:shadow-md");
  return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

const TIER_BADGE: Record<string, string> = {
  free:     "border-border bg-muted text-muted-foreground",
  pro:      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  ultimate: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
};

export default async function AdminOverviewPage() {
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo  = new Date(Date.now() -  7 * 86400000).toISOString();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);

  const [
    { count: totalUsers },
    { count: newUsers7d },
    { count: activeSubs },
    { count: trialingSubs },
    { data: usageToday },
    { data: recentUsers },
    { data: subsByPrice },
    { data: growthRaw },
    { data: usageHistory },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
    admin.from("usage_limits").select("ai_messages_used, voice_seconds_used").eq("period_date", today),
    admin.from("profiles").select("id, display_name, subscription_tier, created_at").order("created_at", { ascending: false }).limit(6),
    admin.from("subscriptions").select("stripe_price_id, tier").in("status", ["active"]),
    admin.from("profiles").select("created_at").gte("created_at", fourteenDaysAgo + "T00:00:00Z"),
    admin.from("usage_limits").select("period_date, ai_messages_used, voice_seconds_used").gte("period_date", fourteenDaysAgo).order("period_date"),
  ]);

  // MRR
  const MRR_MAP: Record<string, number> = {
    [env.STRIPE_PRICE_PRO_MONTHLY      ?? ""]: 7.99,
    [env.STRIPE_PRICE_PRO_YEARLY       ?? ""]: 47.88 / 12,
    [env.STRIPE_PRICE_ULTIMATE_MONTHLY ?? ""]: 12.99,
    [env.STRIPE_PRICE_ULTIMATE_YEARLY  ?? ""]: 77.88 / 12,
  };
  const mrr = (subsByPrice ?? []).reduce(
    (sum, s) => sum + (s.stripe_price_id ? (MRR_MAP[s.stripe_price_id] ?? 0) : 0),
    0,
  );

  // Today totals
  const aiToday    = (usageToday ?? []).reduce((s, r) => s + (r.ai_messages_used   ?? 0), 0);
  const voiceToday = Math.round((usageToday ?? []).reduce((s, r) => s + (r.voice_seconds_used ?? 0), 0) / 60);

  // Last 14 days labels
  const days14 = Array.from({ length: 14 }, (_, i) => {
    return new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10);
  });

  // User growth chart
  const growthByDay = (growthRaw ?? []).reduce<Record<string, number>>((acc, p) => {
    const day = p.created_at.slice(0, 10);
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});
  const growthChartData = days14.map((d) => ({ date: d.slice(5), users: growthByDay[d] ?? 0 }));

  // AI usage chart
  const usageChartData = days14.map((day) => {
    const rows = (usageHistory ?? []).filter((r) => r.period_date === day);
    return {
      date: day.slice(5),
      messages: rows.reduce((s, r) => s + (r.ai_messages_used ?? 0), 0),
      voice:    Math.round(rows.reduce((s, r) => s + (r.voice_seconds_used ?? 0), 0) / 60),
    };
  });

  // Tier pie data
  const tierCounts = (subsByPrice ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.tier] = (acc[s.tier] ?? 0) + 1;
    return acc;
  }, {});
  const paidCount = Object.values(tierCounts).reduce((s, v) => s + v, 0);
  const freeCount = Math.max(0, (totalUsers ?? 0) - paidCount - (trialingSubs ?? 0));
  const tierChartData = [
    { name: "Free",      value: freeCount },
    { name: "Pro",       value: tierCounts["pro"]      ?? 0 },
    { name: "Ultimate",  value: tierCounts["ultimate"] ?? 0 },
    { name: "Trialing",  value: trialingSubs ?? 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform health at a glance.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total users"  value={totalUsers  ?? 0} subtitle={`+${newUsers7d ?? 0} this week`} icon={Users}     color="bg-violet-100 dark:bg-violet-900/30 text-violet-600" href={routes.adminUsers} />
        <StatCard title="Active subs"  value={activeSubs  ?? 0} subtitle={`${trialingSubs ?? 0} trialing`}  icon={CreditCard} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" href={routes.adminSubscriptions} />
        <StatCard title="MRR"          value={`$${mrr.toFixed(0)}`} subtitle="Active only"                 icon={TrendingUp} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" />
        <StatCard title="AI msgs today" value={aiToday}   subtitle={`${voiceToday} voice min`}              icon={Zap}        color="bg-amber-100 dark:bg-amber-900/30 text-amber-600" href={routes.adminUsage} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold">New users — last 14 days</p>
          <UserGrowthChart data={growthChartData} />
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-1 text-sm font-semibold">Subscription tiers</p>
          {tierChartData.length > 0 ? (
            <TierPieChart data={tierChartData} />
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* AI usage chart */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold">AI usage — last 14 days</p>
        <UsageChart data={usageChartData} />
      </div>

      {/* Recent signups */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">Recent signups</p>
          <Link href={routes.adminUsers} className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        <div className="divide-y">
          {(recentUsers ?? []).map((u) => (
            <div key={u.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{u.display_name ?? "Unnamed user"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", TIER_BADGE[u.subscription_tier] ?? TIER_BADGE.free)}>
                {u.subscription_tier}
              </span>
            </div>
          ))}
          {!recentUsers?.length && (
            <p className="py-6 text-center text-sm text-muted-foreground">No users yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
