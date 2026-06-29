import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Zap, Mic, BarChart3, Users } from "lucide-react";
import { UsageChart } from "@/components/admin/overview-charts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "AI Usage" };

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

export default async function AdminAiUsagePage() {
  const admin = createAdminClient();
  const today           = new Date().toISOString().slice(0, 10);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);

  const [
    { data: usageToday },
    { data: usageHistory },
    { data: topUsers },
    { data: profiles },
  ] = await Promise.all([
    admin.from("usage_limits").select("ai_messages_used, voice_seconds_used").eq("period_date", today),
    admin.from("usage_limits").select("period_date, ai_messages_used, voice_seconds_used").gte("period_date", fourteenDaysAgo).order("period_date"),
    admin.from("usage_limits").select("user_id, ai_messages_used").eq("period_date", today).order("ai_messages_used", { ascending: false }).limit(10),
    admin.from("profiles").select("id, display_name"),
  ]);

  const aiToday          = (usageToday ?? []).reduce((s, r) => s + (r.ai_messages_used   ?? 0), 0);
  const voiceToday       = Math.round((usageToday ?? []).reduce((s, r) => s + (r.voice_seconds_used ?? 0), 0) / 60);
  const activeUsersToday = (usageToday ?? []).filter((r) => r.ai_messages_used > 0).length;

  const days14 = Array.from({ length: 14 }, (_, i) =>
    new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
  );

  const usageChartData = days14.map((day) => {
    const rows = (usageHistory ?? []).filter((r) => r.period_date === day);
    return {
      date:     day.slice(5),
      messages: rows.reduce((s, r) => s + (r.ai_messages_used ?? 0), 0),
      voice:    Math.round(rows.reduce((s, r) => s + (r.voice_seconds_used ?? 0), 0) / 60),
    };
  });

  const total14d = usageChartData.reduce((s, d) => s + d.messages, 0);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? "Unnamed"]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">AI Usage</h1>
        <p className="mt-1 text-sm text-muted-foreground">Message and voice consumption across all users.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat title="AI messages today"  value={aiToday}          icon={Zap}      cls="bg-violet-100 dark:bg-violet-900/30 text-violet-600" />
        <Stat title="Voice today"        value={`${voiceToday} min`} icon={Mic}   cls="bg-blue-100 dark:bg-blue-900/30 text-blue-600" />
        <Stat title="Active users today" value={activeUsersToday}  icon={Users}   cls="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" />
        <Stat title="Messages (14 days)" value={total14d}          icon={BarChart3} cls="bg-amber-100 dark:bg-amber-900/30 text-amber-600" />
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold">Usage — last 14 days</p>
        <UsageChart data={usageChartData} />
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-sm bg-violet-600" /> AI messages</span>
          <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-sm bg-blue-600" /> Voice minutes</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold">Top users today</p>
        <div className="divide-y">
          {(topUsers ?? []).filter((u) => u.ai_messages_used > 0).map((u, i) => (
            <div key={u.user_id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <p className="text-sm font-medium">{profileMap.get(u.user_id) ?? u.user_id.slice(0, 8) + "…"}</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold">
                <Zap className="size-3.5 text-violet-500" />
                {u.ai_messages_used}
              </span>
            </div>
          ))}
          {!(topUsers ?? []).some((u) => u.ai_messages_used > 0) && (
            <p className="py-6 text-center text-sm text-muted-foreground">No AI activity today.</p>
          )}
        </div>
      </div>
    </div>
  );
}
