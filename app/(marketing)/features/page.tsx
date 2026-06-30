import type { Metadata } from "next";
import Link from "next/link";
import {
  MessagesSquare,
  AudioLines,
  SpellCheck,
  PenLine,
  Headphones,
  Trophy,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { features } from "@/content/landing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import type { IconKey } from "@/content/landing";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Features — Fluentra",
  description:
    "Everything you need to become fluent: AI conversation, pronunciation scoring, grammar correction, writing coach, listening practice and gamified progress.",
};

const ICONS: Record<IconKey, LucideIcon> = {
  "messages-square": MessagesSquare,
  "audio-lines": AudioLines,
  "spell-check": SpellCheck,
  "pen-line": PenLine,
  headphones: Headphones,
  trophy: Trophy,
};

const ACCENT: Record<string, string> = {
  primary: "from-primary/15 text-primary",
  accent: "from-accent/15 text-accent",
  cyan: "from-brand-cyan/15 text-brand-cyan",
};

const FEATURE_DETAILS: Record<string, { bullets: string[]; badge?: string }> = {
  "AI conversation tutor": {
    badge: "Most popular",
    bullets: [
      "Voice or text — switch mid-conversation",
      "Adapts difficulty in real-time to your level",
      "Remembers your goals and past sessions",
      "100+ languages including rare dialects",
    ],
  },
  "Pronunciation scoring": {
    bullets: [
      "Per-syllable accuracy, fluency & completeness",
      "Native speaker audio for direct comparison",
      "Pinpoints exactly which sounds to fix",
      "Works offline on mobile",
    ],
  },
  "Instant grammar correction": {
    bullets: [
      "Highlights errors as you type",
      "Plain-language explanation for every mistake",
      "Three alternative phrasings to choose from",
      "All corrections saved to your history",
    ],
  },
  "Writing coach": {
    bullets: [
      "Emails, essays, messages and social posts",
      "Tone rewrites: formal, friendly, confident",
      "Vocabulary upgrade suggestions",
      "One-click apply for any suggestion",
    ],
  },
  "Listening practice": {
    bullets: [
      "AI-generated mini-podcasts at your level",
      "Comprehension questions after each episode",
      "Transcript toggle for when you need it",
      "New content every day — never repeats",
    ],
  },
  "Gamified progress": {
    bullets: [
      "XP, streaks and daily missions",
      "Achievements that mark real milestones",
      "Friend leaderboard for healthy competition",
      "Adaptive lessons based on where you slip",
    ],
  },
};

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal preset="fade-up">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Everything you need
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              One platform,{" "}
              <span className="text-primary">every way to learn</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Conversation, pronunciation, grammar, writing and listening — all in one tutor that
              adapts to your level and your goals.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  Start for free <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Feature cards */}
      <section
        id="feature-grid"
        aria-label="Feature list"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = ICONS[f.icon];
            const detail = FEATURE_DETAILS[f.title];
            return (
              <Reveal key={f.title} preset="fade-up">
                <Card className="group relative h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  {detail?.badge && (
                    <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      {detail.badge}
                    </span>
                  )}
                  <CardHeader>
                    <span
                      className={cn(
                        "mb-4 grid size-12 place-items-center rounded-xl bg-gradient-to-br to-transparent ring-1 ring-inset ring-border transition-transform duration-300 group-hover:scale-110",
                        ACCENT[f.accent],
                      )}
                    >
                      <Icon className="size-6" />
                    </span>
                    <CardTitle>{f.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{f.description}</CardDescription>
                  </CardHeader>
                  {detail && (
                    <CardContent>
                      <ul className="space-y-2">
                        {detail.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              </Reveal>
            );
          })}
        </RevealGroup>
      </section>

      {/* CTA banner */}
      <section className="bg-primary/5 py-16 lg:py-20">
        <Reveal preset="fade-up">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to speak with confidence?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of learners already using Fluentra. Start free — no credit card needed.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  Get started free <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">Compare plans</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
