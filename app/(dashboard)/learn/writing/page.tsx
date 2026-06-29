"use client";

import { useState } from "react";
import { PenLine, Send, Copy, Check, Lightbulb } from "lucide-react";
import { LANGUAGE_OPTIONS } from "@/config/languages";
import { cn } from "@/lib/utils";

type WritingResult = {
  corrected: string;
  suggestions: string[];
  toneAnalysis?: string;
  vocabularyEnhancements?: string[];
};

const TYPES = [
  { value: "essay",           label: "Essay" },
  { value: "email",           label: "Email" },
  { value: "job_application", label: "Job application" },
  { value: "message",         label: "Casual message" },
  { value: "social_post",     label: "Social post" },
] as const;

const TONES = [
  { value: "formal",     label: "Formal" },
  { value: "friendly",   label: "Friendly" },
  { value: "confident",  label: "Confident" },
  { value: "concise",    label: "Concise" },
] as const;

export default function WritingPage() {
  const [lang, setLang]     = useState("en");
  const [type, setType]     = useState<typeof TYPES[number]["value"]>("email");
  const [tone, setTone]     = useState<typeof TONES[number]["value"]>("friendly");
  const [text, setText]     = useState("");
  const [result, setResult] = useState<WritingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [copied, setCopied] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          type,
          tone,
          targetLanguage: LANGUAGE_OPTIONS.find((l) => l.code === lang)?.name ?? lang,
        }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json() as WritingResult);
    } catch {
      setError("Writing analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(t: string) {
    await navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Writing Coach</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write in your target language and get AI suggestions to sound more natural.
        </p>
      </div>

      {/* Input panel */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Language</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
              {LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value as typeof tone)}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
              {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your text here…"
          rows={7}
          maxLength={5000}
          className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm outline-none ring-ring focus:ring-2 resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{text.length} / 5000</span>
          <button onClick={submit} disabled={loading || !text.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {loading ? <PenLine className="size-4 animate-pulse" /> : <Send className="size-4" />}
            {loading ? "Analyzing…" : "Get feedback"}
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Improved version */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Improved version</p>
              <button onClick={() => copy(result.corrected)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs hover:bg-muted transition-colors">
                {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed">{result.corrected}</p>
          </div>

          {/* Tone analysis */}
          {result.toneAnalysis && (
            <div className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm text-sm">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium">Tone analysis</p>
                <p className="mt-0.5 text-muted-foreground">{result.toneAnalysis}</p>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <p className="text-sm font-semibold">Suggestions</p>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-xl bg-muted/30 px-3 py-2.5 text-sm">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Vocabulary enhancements */}
          {result.vocabularyEnhancements && result.vocabularyEnhancements.length > 0 && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <p className="text-sm font-semibold">Vocabulary upgrades</p>
              <ul className="space-y-1.5">
                {result.vocabularyEnhancements.map((v, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
