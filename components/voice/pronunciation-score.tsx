"use client";

import { Sparkles, Gauge } from "lucide-react";
import type { PronunciationScore } from "@/lib/pronunciation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function tone(value: number) {
  if (value >= 80) return { bar: "bg-success", text: "text-success" };
  if (value >= 60) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-destructive", text: "text-destructive" };
}

function Metric({ label, value }: { label: string; value: number }) {
  const t = tone(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold tabular-nums", t.text)}>{Math.round(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700", t.bar)}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function PronunciationScorePanel({
  score,
  scoring,
}: {
  score?: PronunciationScore;
  scoring?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Gauge className="size-4 text-primary" /> Pronunciation
          </span>
          {score &&
            (score.graded ? (
              <Badge variant="success">Measured</Badge>
            ) : (
              <Badge variant="info" className="gap-1">
                <Sparkles className="size-3" /> AI estimate
              </Badge>
            ))}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scoring && !score ? (
          <div className="space-y-3">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-3/4" />
          </div>
        ) : !score ? (
          <p className="text-sm text-muted-foreground">
            Speak a phrase and your accuracy, fluency and completeness scores appear here with tips.
          </p>
        ) : (
          <>
            <div className="grid gap-3">
              <Metric label="Accuracy" value={score.accuracy} />
              <Metric label="Fluency" value={score.fluency} />
              <Metric label="Completeness" value={score.completeness} />
              <Metric label="Confidence" value={score.confidence} />
            </div>

            {score.phonemes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sounds
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {score.phonemes.map((p, i) => (
                    <span
                      key={`${p.symbol}-${i}`}
                      className={cn(
                        "rounded-md border px-1.5 py-0.5 font-mono text-xs",
                        tone(p.score).text,
                      )}
                    >
                      {p.symbol}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {score.tips.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tips
                </p>
                <ul className="space-y-1.5 text-sm">
                  {score.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
