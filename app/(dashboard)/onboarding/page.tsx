"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { LANGUAGE_OPTIONS } from "@/config/languages";
import { CEFR_LEVELS } from "@/lib/ai/types";
import { useLearningSession } from "@/stores/learning-session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CefrLevel } from "@/lib/ai/types";

const LEVEL_DESCRIPTIONS: Record<CefrLevel, string> = {
  A1: "Complete beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper intermediate",
  C1: "Advanced",
  C2: "Mastery",
};

export default function OnboardingPage() {
  const router = useRouter();
  const session = useLearningSession();

  const [target, setTarget] = useState("en");
  const [native, setNative] = useState("ka");
  const [level, setLevel] = useState<CefrLevel>("A1");
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    setSaving(true);
    session.setLanguages(native, target);
    session.setLevel(level);

    // Best-effort: mark user as onboarded in DB (silently ignore if table missing)
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nativeLanguage: native, targetLanguage: target, level }),
      });
    } catch {
      // ignore
    }

    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
          <Sparkles className="size-7" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Welcome to Fluentra!</h1>
        <p className="text-muted-foreground">
          Let&apos;s personalise your experience. This takes 30 seconds.
        </p>
      </div>

      {/* Target language */}
      <div className="space-y-3">
        <h2 className="font-semibold">What language do you want to learn?</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {LANGUAGE_OPTIONS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setTarget(l.code)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-all hover:border-primary/50",
                target === l.code
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-xs font-bold tracking-wide opacity-60">{l.code.toUpperCase()}</span>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Native language */}
      <div className="space-y-3">
        <h2 className="font-semibold">What&apos;s your native language?</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {LANGUAGE_OPTIONS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setNative(l.code)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-all hover:border-primary/50",
                native === l.code
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-xs font-bold tracking-wide opacity-60">{l.code.toUpperCase()}</span>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div className="space-y-3">
        <h2 className="font-semibold">What&apos;s your current level?</h2>
        <div className="grid grid-cols-3 gap-2">
          {CEFR_LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-all hover:border-primary/50",
                level === l
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "bg-card hover:text-foreground",
              )}
            >
              <div className={cn("text-sm font-bold", level === l ? "text-primary" : "")}>{l}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{LEVEL_DESCRIPTIONS[l]}</div>
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="gradient"
        size="lg"
        className="w-full"
        onClick={handleStart}
        disabled={saving || target === native}
      >
        {saving ? "Setting up…" : "Start learning"}
        {!saving && <ArrowRight />}
      </Button>

      {target === native && (
        <p className="text-center text-sm text-muted-foreground">
          Choose a different language to learn from your native language.
        </p>
      )}
    </div>
  );
}
