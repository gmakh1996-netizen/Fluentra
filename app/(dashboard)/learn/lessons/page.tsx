import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireUserPage } from "@/lib/auth";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Lessons — Fluentra" };

const TOPICS = [
  { emoji: "👋", title: "Greetings & Introductions", desc: "Introduce yourself and greet people naturally.", level: "A1", category: "Everyday" },
  { emoji: "🍽️", title: "At the Restaurant", desc: "Order food, ask for the bill, handle dining situations.", level: "A1", category: "Everyday" },
  { emoji: "✈️", title: "Travel & Directions", desc: "Navigate airports, ask directions, book accommodation.", level: "A2", category: "Travel" },
  { emoji: "🛍️", title: "Shopping", desc: "Ask about prices, sizes, and make purchases confidently.", level: "A2", category: "Everyday" },
  { emoji: "💼", title: "Business Communication", desc: "Emails, meetings, presentations, and professional small talk.", level: "B1", category: "Business" },
  { emoji: "🏥", title: "At the Doctor", desc: "Describe symptoms, understand medical advice.", level: "B1", category: "Practical" },
  { emoji: "📰", title: "News & Current Events", desc: "Discuss world events, share opinions, use news vocabulary.", level: "B2", category: "Culture" },
  { emoji: "🤝", title: "Negotiations", desc: "Compromise, persuade, and handle high-stakes conversations.", level: "C1", category: "Business" },
  { emoji: "🗣️", title: "Idioms & Expressions", desc: "Sound like a native speaker with common phrases.", level: "B2", category: "Culture" },
  { emoji: "👨‍👩‍👧", title: "Family & Relationships", desc: "Talk about family, relationships, and social situations.", level: "A2", category: "Everyday" },
  { emoji: "🎓", title: "Academic Discussion", desc: "Present arguments, cite sources, debate complex topics.", level: "C1", category: "Academic" },
  { emoji: "🏋️", title: "Health & Fitness", desc: "Discuss diet, exercise, and healthy lifestyle habits.", level: "B1", category: "Practical" },
] as const;

const LEVEL_CLS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  A2: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  B1: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  B2: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  C1: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  C2: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
};

export default async function LessonsPage() {
  await requireUserPage();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Lessons</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a topic and practice with your AI tutor in a focused conversation.
        </p>
      </div>

      {/* Quick start banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div>
          <p className="font-semibold">Start a custom lesson</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Tell the AI tutor exactly what you want to practice.
          </p>
        </div>
        <Link
          href={routes.chat}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open AI Chat <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Topic grid */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Browse topics
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => (
            <Link
              key={t.title}
              href={`${routes.chat}?topic=${encodeURIComponent(t.title)}`}
              className="group flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <span className="shrink-0 text-2xl">{t.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold", LEVEL_CLS[t.level])}>
                    {t.level}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
