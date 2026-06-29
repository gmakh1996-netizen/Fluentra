"use client";

import { useState, useRef } from "react";
import { Headphones, Play, Square, RefreshCw, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { LANGUAGE_OPTIONS } from "@/config/languages";
import { CEFR_LEVELS } from "@/lib/ai/types";
import { DEFAULT_VOICE_ID } from "@/config/voices";
import { cn } from "@/lib/utils";

type Question = { question: string; options: string[]; correctIndex: number };
type Passage  = { title: string; passage: string; questions: Question[] };

const TOPICS = ["Daily life", "Travel", "Science", "History", "Culture", "Business", "Nature", "Sports", "Technology", "Food"];

export default function ListeningPage() {
  const [lang, setLang]         = useState("en");
  const [native, setNative]     = useState("ka");
  const [level, setLevel]       = useState("B1");
  const [topic, setTopic]       = useState("Daily life");
  const [passage, setPassage]   = useState<Passage | null>(null);
  const [loading, setLoading]   = useState(false);
  const [playing, setPlaying]   = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [showText, setShowText] = useState(false);
  const [answers, setAnswers]   = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function generate() {
    setLoading(true);
    setError("");
    setPassage(null);
    setShowText(false);
    setAnswers({});
    setSubmitted(false);
    try {
      const res = await fetch("/api/ai/passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          language:       LANGUAGE_OPTIONS.find((l) => l.code === lang)?.name ?? lang,
          nativeLanguage: LANGUAGE_OPTIONS.find((l) => l.code === native)?.name ?? native,
          level,
        }),
      });
      if (!res.ok) throw new Error();
      setPassage(await res.json() as Passage);
    } catch {
      setError("Failed to generate passage. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function listen() {
    if (!passage) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    setLoadingAudio(true);
    try {
      const res = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: passage.passage, voiceId: DEFAULT_VOICE_ID, speed: 0.9 }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) audioRef.current.src = url;
      else audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlaying(false);
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setError("Audio playback failed. Check ElevenLabs configuration.");
    } finally {
      setLoadingAudio(false);
    }
  }

  const score = submitted
    ? passage?.questions.filter((q, i) => answers[i] === q.correctIndex).length ?? 0
    : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Listening Practice</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-generated audio passages with comprehension questions.
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <p className="text-sm font-semibold">Generate a listening exercise</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Listen in</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none ring-ring focus:ring-2">
              {LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Questions in</label>
            <select value={native} onChange={(e) => setNative(e.target.value)}
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
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? <RefreshCw className="size-4 animate-spin" /> : <Headphones className="size-4" />}
          {loading ? "Generating…" : "Generate exercise"}
        </button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Passage player */}
      {passage && (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{passage.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{level} · {LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowText((v) => !v)}
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
                  {showText ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {showText ? "Hide" : "Transcript"}
                </button>
                <button onClick={listen} disabled={loadingAudio}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                    playing ? "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20" : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}>
                  {loadingAudio ? <RefreshCw className="size-4 animate-spin" /> : playing ? <Square className="size-4" /> : <Play className="size-4" />}
                  {loadingAudio ? "Loading…" : playing ? "Stop" : "Listen"}
                </button>
              </div>
            </div>

            {showText && (
              <div className="rounded-xl bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-line">
                {passage.passage}
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
            <p className="text-sm font-semibold">Comprehension questions</p>
            {passage.questions.map((q, qi) => (
              <div key={qi} className="space-y-2">
                <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[qi] === oi;
                    const isCorrect  = submitted && oi === q.correctIndex;
                    const isWrong    = submitted && isSelected && oi !== q.correctIndex;
                    return (
                      <button key={oi} onClick={() => !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))}
                        disabled={submitted}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left transition-colors",
                          isCorrect ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" :
                          isWrong   ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300" :
                          isSelected ? "border-primary bg-primary/10" : "hover:bg-muted",
                        )}>
                        {submitted && isCorrect && <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />}
                        {submitted && isWrong   && <XCircle     className="size-4 shrink-0 text-red-600" />}
                        {!submitted && (
                          <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "")}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                        )}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {!submitted ? (
              <button onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length < passage.questions.length}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                Submit answers
              </button>
            ) : (
              <div className={cn("rounded-xl p-4 text-center",
                score === 3 ? "bg-emerald-50 dark:bg-emerald-950/30" : score >= 2 ? "bg-blue-50 dark:bg-blue-950/30" : "bg-amber-50 dark:bg-amber-950/30")}>
                <p className="text-lg font-bold">{score} / {passage.questions.length} correct</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {score === 3 ? "Perfect score!" : score >= 2 ? "Well done!" : "Keep practising — you'll get there!"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
