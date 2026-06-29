"use client";

import { Volume2, Sparkles } from "lucide-react";
import type { Turn } from "@/hooks/use-voice-conversation";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

function scoreTone(v: number) {
  if (v >= 80) return "text-success";
  if (v >= 60) return "text-warning";
  return "text-destructive";
}

/** One spoken turn rendered as a chat bubble, with audio replay. */
export function VoiceMessage({ turn, onReplay }: { turn: Turn; onReplay: (t: Turn) => void }) {
  const isUser = turn.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
          isUser ? "bg-secondary text-secondary-foreground" : "bg-brand-gradient text-white",
        )}
        aria-hidden
      >
        {isUser ? "You" : <Sparkles className="size-4" />}
      </span>

      <div className={cn("max-w-[80%] space-y-1", isUser ? "items-end text-right" : "items-start")}>
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "rounded-tr-sm bg-secondary text-secondary-foreground"
              : "rounded-tl-sm border bg-card",
          )}
        >
          {turn.text}
        </div>

        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          {turn.audioUrl && (
            <button
              onClick={() => onReplay(turn)}
              className="inline-flex items-center gap-1 rounded px-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Volume2 className="size-3.5" /> Replay
            </button>
          )}
          {isUser && turn.scoring && (
            <span className="inline-flex items-center gap-1">
              <Spinner className="size-3" /> Scoring…
            </span>
          )}
          {isUser && turn.score && (
            <span className={cn("font-medium", scoreTone(turn.score.accuracy))}>
              {Math.round(turn.score.accuracy)}% accuracy
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
