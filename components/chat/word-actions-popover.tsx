"use client";

import { useEffect, useRef, useState } from "react";
import { Languages, BookOpen, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslateResult {
  translation: string;
  romanization?: string;
  notes?: string;
}

interface ExplainResult {
  term: string;
  partOfSpeech: string;
  definition: string;
  examples: string[];
  synonyms: string[];
  tip?: string;
}

interface WordActionsPopoverProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  targetLanguage: string;
  nativeLanguage: string;
}

export function WordActionsPopover({
  containerRef,
  targetLanguage,
  nativeLanguage,
}: WordActionsPopoverProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [mode, setMode] = useState<"idle" | "translate" | "explain">("idle");
  const [translateResult, setTranslateResult] = useState<TranslateResult | null>(null);
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;

      const text = sel.toString().trim();
      if (text.length < 1 || text.length > 200) return;

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setSelectedText(text);
      setPosition({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 8,
      });
      setMode("idle");
      setTranslateResult(null);
      setExplainResult(null);
    };

    container.addEventListener("mouseup", onMouseUp);
    return () => container.removeEventListener("mouseup", onMouseUp);
  }, [containerRef]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const close = () => {
    setPosition(null);
    setMode("idle");
    setTranslateResult(null);
    setExplainResult(null);
  };

  const handleTranslate = async () => {
    setMode("translate");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, fromLanguage: targetLanguage, toLanguage: nativeLanguage }),
      });
      if (res.ok) setTranslateResult(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    setMode("explain");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: selectedText, targetLanguage, nativeLanguage }),
      });
      if (res.ok) setExplainResult(await res.json());
    } finally {
      setLoading(false);
    }
  };

  if (!position) return null;

  const hasResult = translateResult || explainResult;

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 animate-scale-in"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      {!hasResult ? (
        <div className="flex items-center gap-1 rounded-lg border bg-popover px-1.5 py-1 shadow-lg">
          <button
            onClick={handleTranslate}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-popover-foreground hover:bg-secondary"
          >
            <Languages className="size-3.5" />
            Translate
          </button>
          <div className="h-4 w-px bg-border" />
          <button
            onClick={handleExplain}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-popover-foreground hover:bg-secondary"
          >
            <BookOpen className="size-3.5" />
            Explain
          </button>
          <div className="h-4 w-px bg-border" />
          <button onClick={close} className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div className="w-72 rounded-lg border bg-popover p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {mode === "translate" ? "Translation" : "Explanation"}
            </span>
            <button onClick={close} className="rounded p-0.5 text-muted-foreground hover:bg-secondary">
              <X className="size-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="size-4 animate-spin" />
              <span>Loading…</span>
            </div>
          ) : translateResult ? (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">{translateResult.translation}</p>
              {translateResult.romanization && (
                <p className="text-xs text-muted-foreground italic">{translateResult.romanization}</p>
              )}
              {translateResult.notes && (
                <p className="text-xs text-muted-foreground border-t pt-1.5 mt-1.5">{translateResult.notes}</p>
              )}
            </div>
          ) : explainResult ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm">{explainResult.term}</span>
                <span className="text-xs text-muted-foreground italic">{explainResult.partOfSpeech}</span>
              </div>
              <p className="text-sm">{explainResult.definition}</p>
              {explainResult.examples.length > 0 && (
                <div className="space-y-0.5">
                  {explainResult.examples.map((ex, i) => (
                    <p key={i} className="text-xs text-muted-foreground italic">"{ex}"</p>
                  ))}
                </div>
              )}
              {explainResult.synonyms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {explainResult.synonyms.map((s) => (
                    <span key={s} className="rounded-full border px-2 py-0.5 text-xs">{s}</span>
                  ))}
                </div>
              )}
              {explainResult.tip && (
                <p className="text-xs text-primary border-t pt-1.5">{explainResult.tip}</p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
