import type { Metadata } from "next";
import { requireUserPage } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProgressCharts } from "./progress-charts";
import { TrendingUp, Zap, Mic, Flame, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/config/plans";

export const metadata: Metadata = { title: "Progress — Fluentra" };

function Stat({ title, value, sub, icon: Icon, color }: {
  title: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>; color: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-3xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-xl", color)}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export default async function ProgressPage() {
  const { user, profile } = await requireUserPage();
  const admin = createAdminClient();
  const tier  = profile?.subscription_tier ?? "free";
  const plan  = PLANS[tier];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const { data: usage } = await admin
    .from("usage_limits")
    .select("period_date, ai_messages_used, voice_seconds_used")
    .eq("user_id", user.id)
    .gte("period_date", thirtyDaysAgo)
    .order("period_date");

  const rows = usage ?? [];

  // Totals
  const totalMessages = rows.reduce((s, r) => s + (r.ai_messages_used ?? 0), 0);
  const totalVoiceMin = Math.round(rows.reduce((s, r) => s + (r.voice_seconds_used ?? 0), 0) / 60);
  const activeDays    = rows.filter((r) => r.ai_messages_used > 0 || r.voice_seconds_used > 0).length;

  // Streak
  const days30 = Array.from({ length: 30 }, (_, i) =>
    new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
  );
  const activeSet = new Set(
    rows.filter((r) => r.ai_messages_used > 0 || r.voice_seconds_used > 0).map((r) => r.period_date),
  );
  let streak = 0;
  for (let i = days30.length - 1; i >= 0; i--) {
    if (activeSet.has(days30[i]!)) streak++;
    else break;
  }

  // Chart data
  const last14 = days30.slice(-14);
  const byDay = Object.fromEntries(rows.map((r) => [r.period_date, r]));
  const chartData = last14.map((day) => ({
    date:     day.slice(5),
    messages: byDay[day]?.ai_messages_used ?? 0,
    voice:    Math.round((byDay[day]?.voice_seconds_used ?? 0) / 60),
  }));

  // Calendar data (last 30 days)
  const calData = days30.map((day) => ({
    day,
    active: activeSet.has(day),
    messages: byDay[day]?.ai_messages_used ?? 0,
  }));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your learning activity over the last 30 days.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat title="Messages"    value={totalMessages}    sub="last 30 days"  icon={Zap}        color="bg-violet-100 dark:bg-violet-900/30 text-violet-600" />
        <Stat title="Voice"       value={`${totalVoiceMin}m`} sub="last 30 days" icon={Mic}       color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" />
        <Stat title="Active days" value={activeDays}       sub="out of 30"     icon={Calendar}   color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" />
        <Stat title="Streak"      value={`${streak}d`}    sub="current"       icon={Flame}      color="bg-amber-100 dark:bg-amber-900/30 text-amber-600" />
      </div>

      {/* Chart */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold">Daily activity — last 14 days</p>
        <ProgressCharts data={chartData} />
      </div>

      {/* Calendar heatmap */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold">Activity calendar — last 30 days</p>
        <div className="flex flex-wrap gap-1.5">
          {calData.map(({ day, active, messages }) => (
            <div key={day} title={`${day}: ${messages} messages`}
              className={cn("size-7 rounded-md transition-colors", active ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-muted inline-block" /> No activity</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-primary inline-block" /> Active day</span>
        </div>
      </div>

      {/* Plan limits */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Current plan limits — <span className="capitalize">{plan.name}</span></p>
        </div>
        {[
          { label: "AI messages / day", limit: plan.limits.aiMessagesPerDay },
          { label: "Voice / day",       limit: Math.round(plan.limits.voiceSecondsPerDay / 60), unit: "min" },
        ].map(({ label, limit, unit }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold">
                {limit >= 2000 ? "Unlimited" : `${limit}${unit ? " " + unit : ""}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
