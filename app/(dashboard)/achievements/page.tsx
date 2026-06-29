import type { Metadata } from "next";
import { requireUserPage } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export const metadata: Metadata = { title: "Achievements — Fluentra" };

type Achievement = {
  id: string; emoji: string; title: string; desc: string;
  xp: number; unlocked: boolean; progress?: number; target?: number;
};

export default async function AchievementsPage() {
  const { user } = await requireUserPage();
  const admin = createAdminClient();

  const { data: usage } = await admin
    .from("usage_limits")
    .select("period_date, ai_messages_used, voice_seconds_used")
    .eq("user_id", user.id)
    .order("period_date");

  const rows = usage ?? [];
  const totalMessages = rows.reduce((s, r) => s + (r.ai_messages_used ?? 0), 0);
  const totalVoiceSec = rows.reduce((s, r) => s + (r.voice_seconds_used ?? 0), 0);
  const activeDays    = new Set(rows.filter((r) => r.ai_messages_used > 0 || r.voice_seconds_used > 0).map((r) => r.period_date)).size;

  // Streak
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  const daySet = new Set(rows.filter((r) => r.ai_messages_used > 0).map((r) => r.period_date));
  for (let i = 0; i < 365; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    if (daySet.has(d)) streak++;
    else break;
  }

  const ACHIEVEMENTS: Achievement[] = [
    { id: "welcome",      emoji: "🎉", title: "Welcome!",         desc: "Join Fluentra",                   xp: 25,  unlocked: true },
    { id: "first_msg",    emoji: "💬", title: "First Words",      desc: "Send your first AI message",      xp: 50,  unlocked: totalMessages >= 1,  progress: Math.min(totalMessages, 1), target: 1 },
    { id: "ten_msgs",     emoji: "🗣️", title: "Getting Started",  desc: "Send 10 AI messages",             xp: 100, unlocked: totalMessages >= 10, progress: Math.min(totalMessages, 10), target: 10 },
    { id: "fifty_msgs",   emoji: "📢", title: "Conversationalist",desc: "Send 50 AI messages",             xp: 200, unlocked: totalMessages >= 50, progress: Math.min(totalMessages, 50), target: 50 },
    { id: "hundred_msgs", emoji: "🏆", title: "Power Learner",    desc: "Send 100 AI messages",            xp: 350, unlocked: totalMessages >= 100, progress: Math.min(totalMessages, 100), target: 100 },
    { id: "first_voice",  emoji: "🎙️", title: "Speaking Up",      desc: "Complete a voice session",        xp: 150, unlocked: totalVoiceSec > 0 },
    { id: "voice_30min",  emoji: "🎤", title: "Voice Veteran",    desc: "Practice voice for 30 minutes",   xp: 300, unlocked: totalVoiceSec >= 1800, progress: Math.min(Math.round(totalVoiceSec / 60), 30), target: 30 },
    { id: "streak_3",     emoji: "🔥", title: "On a Roll",        desc: "3-day learning streak",           xp: 100, unlocked: streak >= 3,  progress: Math.min(streak, 3), target: 3 },
    { id: "streak_7",     emoji: "⚡", title: "Week Warrior",     desc: "7-day learning streak",           xp: 250, unlocked: streak >= 7,  progress: Math.min(streak, 7), target: 7 },
    { id: "streak_30",    emoji: "🌟", title: "Dedicated Learner",desc: "30-day learning streak",          xp: 750, unlocked: streak >= 30, progress: Math.min(streak, 30), target: 30 },
    { id: "active_7",     emoji: "📅", title: "Regular Visitor",  desc: "Be active on 7 different days",   xp: 150, unlocked: activeDays >= 7,  progress: Math.min(activeDays, 7),  target: 7 },
    { id: "active_30",    emoji: "🗓️", title: "Consistent Learner",desc: "Be active on 30 different days", xp: 500, unlocked: activeDays >= 30, progress: Math.min(activeDays, 30), target: 30 },
  ];

  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked);
  const totalXp   = unlocked.reduce((s, a) => s + a.xp, 0);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Achievements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {unlocked.length} / {ACHIEVEMENTS.length} unlocked · {totalXp} XP earned
        </p>
      </div>

      {/* XP bar */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Total XP</span>
          <span className="font-bold text-primary">{totalXp} XP</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min((unlocked.length / ACHIEVEMENTS.length) * 100, 100)}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{unlocked.length} of {ACHIEVEMENTS.length} achievements</p>
      </div>

      {/* Achievement grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.id} className={cn(
            "relative rounded-2xl border p-4 shadow-sm transition-all",
            a.unlocked ? "bg-card" : "bg-muted/30 opacity-70",
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl",
                a.unlocked ? "bg-primary/10" : "bg-muted",
              )}>
                {a.unlocked ? a.emoji : <Lock className="size-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{a.title}</p>
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    a.unlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}>
                    {a.xp} XP
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.desc}</p>
                {a.target && !a.unlocked && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary/50 transition-all"
                        style={{ width: `${((a.progress ?? 0) / a.target) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{a.progress ?? 0} / {a.target}</p>
                  </div>
                )}
              </div>
              {a.unlocked && (
                <span className="absolute right-3 top-3 text-lg">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
