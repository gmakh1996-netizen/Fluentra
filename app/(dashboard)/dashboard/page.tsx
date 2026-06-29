import type { Metadata } from "next";
import Link from "next/link";
import {
  Flame, Zap, BookOpen, MessageCircle, Mic, TrendingUp,
  Star, Target, ArrowRight, Trophy, Clock, Brain,
} from "lucide-react";
import { requireUserPage } from "@/lib/auth";
import { routes } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard — Fluentra" };

const MOCK_STREAK = 7;
const MOCK_XP = 1240;
const MOCK_WORDS = 312;
const MOCK_LESSONS = 24;
const MOCK_GOAL_MINS = 12;
const MOCK_GOAL_TARGET = 15;

const WEEKLY_DATA = [
  { day: "Mon", minutes: 18 },
  { day: "Tue", minutes: 25 },
  { day: "Wed", minutes: 10 },
  { day: "Thu", minutes: 30 },
  { day: "Fri", minutes: 22 },
  { day: "Sat", minutes: 5 },
  { day: "Sun", minutes: 12 },
];

const RECENT_ACTIVITY = [
  { label: "Completed lesson: Past Tense Basics", time: "2h ago", icon: BookOpen, color: "text-indigo-500" },
  { label: "AI chat: 15-minute conversation", time: "5h ago", icon: MessageCircle, color: "text-violet-500" },
  { label: "Voice: Pronunciation drill", time: "Yesterday", icon: Mic, color: "text-cyan-500" },
  { label: "Learned 12 new vocabulary words", time: "Yesterday", icon: Brain, color: "text-emerald-500" },
];

const AI_RECS = [
  {
    title: "Review: Irregular Verbs",
    desc: "You've seen these 8 words 3+ times but still missing them. A quick 5-min drill will lock them in.",
    cta: "Start drill",
    href: routes.vocabulary,
    icon: Brain,
    accent: "from-violet-500/10 to-violet-500/5 border-violet-200 dark:border-violet-900",
    iconBg: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Try: Ordering Food roleplay",
    desc: "Based on your B1 level, this practical scenario will stretch your speaking confidence.",
    cta: "Practice now",
    href: routes.chat,
    icon: MessageCircle,
    accent: "from-indigo-500/10 to-indigo-500/5 border-indigo-200 dark:border-indigo-900",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Goal: 3 more minutes today",
    desc: "You're 80% of the way to your daily goal. Finish strong with a quick listening exercise.",
    cta: "Listen now",
    href: routes.listening,
    icon: Target,
    accent: "from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-900",
    iconBg: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
  },
];

const ACHIEVEMENTS = [
  { label: "7-day streak", icon: Flame, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  { label: "100 words", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
  { label: "First chat", icon: MessageCircle, color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-900/30" },
  { label: "Speed reader", icon: Zap, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
];

function StatCard({
  label, value, sub, icon: Icon, iconClass, valueClass,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string; valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={cn("flex size-8 items-center justify-center rounded-xl", iconClass)}>
          <Icon className="size-4" />
        </div>
      </div>
      <div>
        <p className={cn("font-display text-3xl font-bold tracking-tight tabular-nums", valueClass)}>{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function GoalRing({ done, total }: { done: number; total: number }) {
  const pct = Math.min(done / total, 1);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke="#4f46e5" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl font-bold tabular-nums">{done}</span>
        <span className="text-[10px] text-muted-foreground">/ {total} min</span>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { profile } = await requireUserPage();
  const name = profile?.display_name?.split(" ")[0] ?? "there";
  const tier = profile?.subscription_tier ?? "free";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 max-w-[1200px]">

      {/* Greeting */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}, {name}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {MOCK_STREAK}-day streak · {MOCK_XP.toLocaleString()} XP total
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={tier === "free" ? "secondary" : "gradient"} className="capitalize text-xs">
            {tier} plan
          </Badge>
          <Button asChild variant="gradient" size="sm">
            <Link href={routes.chat}>Continue learning <ArrowRight className="size-3.5" /></Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Day streak" value={MOCK_STREAK} sub="Keep it going!"
          icon={Flame} iconClass="bg-orange-100 dark:bg-orange-900/30 text-orange-500"
          valueClass="text-orange-500"
        />
        <StatCard
          label="Words learned" value={MOCK_WORDS} sub="+12 this week"
          icon={BookOpen} iconClass="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500"
        />
        <StatCard
          label="Lessons done" value={MOCK_LESSONS} sub="4 this week"
          icon={TrendingUp} iconClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500"
          valueClass="text-emerald-600"
        />
        <StatCard
          label="Total XP" value={MOCK_XP.toLocaleString()} sub="Level 8"
          icon={Zap} iconClass="bg-violet-100 dark:bg-violet-900/30 text-violet-500"
          valueClass="text-violet-600"
        />
      </div>

      {/* Daily goal + Weekly activity */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Today&apos;s goal</span>
            <span className="text-xs text-muted-foreground">{MOCK_GOAL_MINS}/{MOCK_GOAL_TARGET} min</span>
          </div>
          <div className="flex items-center gap-5">
            <GoalRing done={MOCK_GOAL_MINS} total={MOCK_GOAL_TARGET} />
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Practice time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-muted-foreground">3 activities done</span>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                {MOCK_GOAL_TARGET - MOCK_GOAL_MINS} min to goal
              </p>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(MOCK_GOAL_MINS / MOCK_GOAL_TARGET) * 100}%` }}
            />
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold">Weekly activity</span>
            <span className="text-xs text-muted-foreground">
              {WEEKLY_DATA.reduce((s, d) => s + d.minutes, 0)} min this week
            </span>
          </div>
          <WeeklyChart data={WEEKLY_DATA} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "AI Chat", desc: "Converse with your tutor", href: routes.chat, icon: MessageCircle, grad: "from-indigo-500 to-violet-500" },
          { label: "Voice Practice", desc: "Improve pronunciation", href: routes.voice, icon: Mic, grad: "from-cyan-500 to-indigo-500" },
          { label: "Lessons", desc: "Structured learning path", href: routes.lessons, icon: BookOpen, grad: "from-violet-500 to-fuchsia-500" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
          >
            <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", a.grad)}>
              <a.icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{a.label}</p>
              <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      {/* AI Recommendations + Recent activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-amber-500" />
            <h2 className="text-sm font-semibold">Recommended for you</h2>
          </div>
          {AI_RECS.map((rec) => (
            <div key={rec.title} className={cn("flex gap-4 rounded-2xl border bg-gradient-to-br p-4", rec.accent)}>
              <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl", rec.iconBg)}>
                <rec.icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{rec.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
                <Link href={rec.href} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  {rec.cta} <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Recent activity</h2>
              </div>
              <Link href={routes.progress} className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <a.icon className={cn("size-3.5", a.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-snug line-clamp-1">{a.label}</p>
                    <p className="text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-amber-500" />
                <h2 className="text-sm font-semibold">Achievements</h2>
              </div>
              <Link href={routes.achievements} className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((a) => (
                <div key={a.label} className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/50 py-3 px-2">
                  <div className={cn("flex size-9 items-center justify-center rounded-xl", a.bg)}>
                    <a.icon className={cn("size-4", a.color)} />
                  </div>
                  <span className="text-[11px] text-center font-medium leading-tight">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
