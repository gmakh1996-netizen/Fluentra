"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Mistake {
  original: string;
  correction: string;
  explanation: string;
}

interface GrammarResult {
  corrected: string;
  mistakes: Mistake[];
  alternatives: string[];
}

interface GrammarPanelProps {
  text: string;
  targetLanguage: string;
  nativeLanguage: string;
  onClose: () => void;
  onUseCorrection: (text: string) => void;
}

export function GrammarPanel({
  text,
  targetLanguage,
  nativeLanguage,
  onClose,
  onUseCorrection,
}: GrammarPanelProps) {
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ranOnce, setRanOnce] = useState(false);

  const check = async () => {
    setLoading(true);
    setError(null);
    setRanOnce(true);
    try {
      const res = await fetch("/api/ai/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage, nativeLanguage }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? "Grammar check failed.");
      }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount
  if (!ranOnce && !loading) check();

  return (
    <div className="rounded-xl border bg-card shadow-lg animate-fade-up">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="size-4 text-primary" />
          <span className="text-sm font-semibold">Grammar check</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Source */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Original
          </p>
          <p className="text-sm italic text-muted-foreground">"{text}"</p>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        ) : result ? (
          <>
            {/* Corrected */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Corrected
              </p>
              <div className="flex items-start gap-2">
                <p
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm",
                    result.mistakes.length === 0
                      ? "bg-success/10 text-success"
                      : "bg-primary/5 border",
                  )}
                >
                  {result.mistakes.length === 0 ? "✓ " : ""}
                  {result.corrected}
                </p>
                {result.corrected !== text && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUseCorrection(result.corrected)}
                    className="shrink-0"
                  >
                    Use
                  </Button>
                )}
              </div>
            </div>

            {/* Mistakes */}
            {result.mistakes.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Issues ({result.mistakes.length})
                </p>
                <div className="space-y-2">
                  {result.mistakes.map((m, i) => (
                    <div key={i} className="rounded-lg border bg-muted/30 px-3 py-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="line-through text-muted-foreground">{m.original}</span>
                        <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                        <span className="font-medium text-primary">{m.correction}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{m.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {result.alternatives.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Alternatives
                </p>
                <div className="space-y-1.5">
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <p className="flex-1 rounded-lg border bg-muted/20 px-3 py-1.5 text-sm">
                        {alt}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUseCorrection(alt)}
                        className="shrink-0 text-xs"
                      >
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
