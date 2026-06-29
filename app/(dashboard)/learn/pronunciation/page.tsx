import type { Metadata } from "next";
import Link from "next/link";
import { Mic, AudioLines, ChevronRight, Star, Volume2, Target } from "lucide-react";
import { requireUserPage } from "@/lib/auth";
import { routes } from "@/config/site";

export const metadata: Metadata = { title: "Pronunciation — Fluentra" };

const TIPS = [
  { icon: "👂", title: "Listen first", desc: "Before speaking, listen to native speakers multiple times. Your ears train your mouth." },
  { icon: "🔁", title: "Repeat out loud", desc: "Silent reading doesn't help. Every word you study should be spoken aloud at least 3 times." },
  { icon: "📱", title: "Record yourself", desc: "Play back recordings to hear your own accent objectively — you will notice errors you can't catch in real time." },
  { icon: "🐢", title: "Slow down", desc: "Reduce speed until each sound is clear, then gradually increase to natural pace." },
  { icon: "👄", title: "Watch mouth movements", desc: "Mimic native speakers by watching how they form sounds, especially vowels and unfamiliar consonants." },
  { icon: "🎯", title: "Target one sound at a time", desc: "Identify your hardest sounds and drill them in isolation before combining them into words and sentences." },
];

const SCORE_GUIDE = [
  { range: "90–100", label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", desc: "Near-native. Keep it up!" },
  { range: "75–89",  label: "Good",      color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30",    desc: "Clear and understandable with minor accent." },
  { range: "60–74",  label: "Fair",      color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30",  desc: "Some sounds need work. Focus on problem areas." },
  { range: "< 60",   label: "Needs work", color: "text-red-600",   bg: "bg-red-50 dark:bg-red-950/30",      desc: "Practice slowly and listen more before speaking." },
];

export default async function PronunciationPage() {
  await requireUserPage();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Pronunciation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Practice speaking and get real-time AI feedback on your pronunciation.
        </p>
      </div>

      {/* CTA → Voice page */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Mic className="size-5" />
          </div>
          <div>
            <p className="font-semibold">Practice with AI tutor</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Speak in real time — the AI listens and scores your pronunciation instantly.
            </p>
          </div>
        </div>
        <Link
          href={routes.voice}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start voice session <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Score guide */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Pronunciation score guide</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SCORE_GUIDE.map((s) => (
            <div key={s.range} className={`rounded-xl p-3 ${s.bg}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${s.color}`}>{s.label}</span>
                <span className="text-xs text-muted-foreground font-mono">{s.range}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Tips for better pronunciation</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TIPS.map((t) => (
            <div key={t.title} className="flex gap-3 rounded-xl bg-muted/30 p-3">
              <span className="text-xl shrink-0">{t.icon}</span>
              <div>
                <p className="text-sm font-medium">{t.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features of voice mode */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <AudioLines className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">What voice mode includes</p>
        </div>
        <ul className="space-y-2">
          {[
            "Real-time speech-to-text transcription",
            "Pronunciation score (0–100) per response",
            "Phoneme-level breakdown of problem sounds",
            "AI responds naturally to continue conversation",
            "Text-to-speech playback at adjustable speed",
            "Works in all 13 supported languages",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Star className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
              {f}
            </li>
          ))}
        </ul>
        <Link href={routes.voice}
          className="mt-2 flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          Go to voice practice <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
