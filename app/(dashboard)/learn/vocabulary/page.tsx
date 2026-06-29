"use client";

import { useState } from "react";
import { Layers, RefreshCw, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { LANGUAGE_OPTIONS } from "@/config/languages";
import { CEFR_LEVELS } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

type VocabItem = {
  word: string;
  translation: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleTranslation: string;
  pronunciation?: string;
};

const TOPICS = ["Food & Drink", "Travel", "Business", "Technology", "Health", "Nature", "Family", "Sports", "Art & Culture", "Shopping"];

export default function VocabularyPage() {
  const [targetLang, setTargetLang]   = useState("en");
  const [nativeLang, setNativeLang]   = useState("ka");
  const [level, setLevel]             = useState("A2");
  const [topic, setTopic]             = useState("Travel");
  const [customTopic, setCustomTopic] = useState("");
  const [cards, setCards]   = useState<VocabItem[]>([]);
  const [index, setIndex]   = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setCards([]);
    setIndex(0);
    setFlipped(false);
    try {
      const res = await fetch("/api/ai/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: customTopic.trim() || topic,
          targetLanguage: LANGUAGE_OPTIONS.find((l) => l.code === targetLang)?.name ?? targetLang,
          nativeLanguage: LANGUAGE_OPTIONS.find((l) => l.code === nativeLang)?.name ?? nativeLang,
          level,
          count: 10,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { items: VocabItem[] };
      setCards(data.items);
    } catch {
      setError("Failed to generate vocabulary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const card = cards[index];
  const progress = cards.length ? Math.round(((index + 1) / cards.length) * 100) : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Vocabulary</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-generated flashcards — tap a card to reveal the translation.
        </p>
      </div>

      {/* Settings */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <p className="text-sm font-semibold">Generate a word set</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Learning</label>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
              {LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Native</label>
            <select value={nativeLang} onChange={(e) => setNativeLang(e.target.value)}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
              {LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
              {CEFR_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Topic</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Or type a custom topic…"
            className="flex-1 rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
          />
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="size-4 animate-spin" /> : <Layers className="size-4" />}
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Flashcard */}
      {cards.length > 0 && card && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span>{index + 1} / {cards.length}</span>
          </div>

          {/* Card with flip */}
          <button
            onClick={() => setFlipped((f) => !f)}
            className="w-full cursor-pointer"
            aria-label="Flip card"
          >
            <div className="relative min-h-[220px] rounded-2xl border bg-card shadow-md p-6 text-left transition-all hover:shadow-lg"
              style={{ perspective: 1000 }}>
              {!flipped ? (
                <div className="flex flex-col h-full gap-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {card.partOfSpeech} · Tap to reveal
                  </p>
                  <p className="font-display text-4xl font-bold tracking-tight">{card.word}</p>
                  {card.pronunciation && (
                    <p className="text-sm text-muted-foreground font-mono">{card.pronunciation}</p>
                  )}
                  <p className="mt-auto text-sm text-muted-foreground italic">"{card.exampleSentence}"</p>
                </div>
              ) : (
                <div className="flex flex-col h-full gap-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Translation</p>
                  <p className="font-display text-3xl font-bold text-primary">{card.translation}</p>
                  <div className="mt-auto space-y-1">
                    <p className="text-sm text-muted-foreground italic">"{card.exampleSentence}"</p>
                    <p className="text-sm font-medium">"{card.exampleTranslation}"</p>
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => { setIndex((i) => Math.max(0, i - 1)); setFlipped(false); }}
              disabled={index === 0}
              className="flex items-center gap-1 rounded-xl border px-3 py-2 text-sm hover:bg-muted disabled:opacity-40 transition-colors">
              <ChevronLeft className="size-4" /> Prev
            </button>
            <button onClick={() => { setFlipped(false); setIndex(0); setCards([]); }}
              className="flex items-center gap-1 rounded-xl border px-3 py-2 text-sm hover:bg-muted transition-colors">
              <RotateCcw className="size-4" /> Restart
            </button>
            <button onClick={() => { setIndex((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}
              disabled={index === cards.length - 1}
              className="flex items-center gap-1 rounded-xl border px-3 py-2 text-sm hover:bg-muted disabled:opacity-40 transition-colors">
              Next <ChevronRight className="size-4" />
            </button>
          </div>

          {/* All words list */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">All words</p>
            <div className="grid grid-cols-2 gap-2">
              {cards.map((c, i) => (
                <button key={i} onClick={() => { setIndex(i); setFlipped(false); }}
                  className={cn("flex items-center justify-between rounded-xl px-3 py-2 text-sm text-left transition-colors hover:bg-muted",
                    i === index && "bg-primary/10 font-medium")}>
                  <span>{c.word}</span>
                  <span className="text-xs text-muted-foreground">{c.translation}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
