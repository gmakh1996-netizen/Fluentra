"use client";

import { useState } from "react";
import { SpellCheck, Send, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { LANGUAGE_OPTIONS } from "@/config/languages";
import { cn } from "@/lib/utils";

type GrammarResult = {
  corrected: string;
  mistakes: { original: string; correction: string; explanation: string }[];
  alternatives: string[];
};

export default function GrammarPage() {
  const [targetLang, setTargetLang] = useState("en");
  const [nativeLang, setNativeLang] = useState("ka");
  const [text, setText]       = useState("");
  const [result, setResult]   = useState<GrammarResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);

  async function check() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage: LANGUAGE_OPTIONS.find((l) => l.code === targetLang)?.name ?? targetLang,
          nativeLanguage: LANGUAGE_OPTIONS.find((l) => l.code === nativeLang)?.name ?? nativeLang,
        }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json() as GrammarResult);
    } catch {
      setError("Grammar check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(t: string) {
    await navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isPerfect = result && result.mistakes.length === 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Grammar Checker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write in your target language and get instant corrections with explanations.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Writing in</label>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
              {LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Explain in</label>
            <select value={nativeLang} onChange={(e) => setNativeLang(e.target.value)}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
              {LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste a sentence or paragraph…"
          rows={5}
          maxLength={2000}
          className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm outline-none ring-ring focus:ring-2 resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{text.length}/2000</span>
          <button
            onClick={check}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <SpellCheck className="size-4 animate-pulse" /> : <Send className="size-4" />}
            {loading ? "Checking…" : "Check grammar"}
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Corrected version */}
          <div className={cn("rounded-2xl border p-5 shadow-sm", isPerfect ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20" : "bg-card")}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                {isPerfect
                  ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  : <SpellCheck className="mt-0.5 size-4 shrink-0 text-primary" />}
                <div>
                  <p className="text-sm font-semibold">{isPerfect ? "Perfect — no mistakes found!" : "Corrected version"}</p>
                  {!isPerfect && <p className="mt-1 text-sm">{result.corrected}</p>}
                </div>
              </div>
              {!isPerfect && (
                <button onClick={() => copyText(result.corrected)}
                  className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs hover:bg-muted transition-colors">
                  {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>

          {/* Mistakes */}
          {result.mistakes.length > 0 && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <p className="text-sm font-semibold">{result.mistakes.length} mistake{result.mistakes.length !== 1 ? "s" : ""} found</p>
              <div className="space-y-3">
                {result.mistakes.map((m, i) => (
                  <div key={i} className="rounded-xl bg-muted/50 p-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="line-through text-destructive">{m.original}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-emerald-600">{m.correction}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
            <p className="text-sm font-semibold">Alternative phrasings</p>
            <div className="space-y-2">
              {result.alternatives.map((alt, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl bg-muted/30 px-3 py-2.5 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">{i + 1}</span>
                  <span>{alt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
