"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { useLearningSession } from "@/stores/learning-session";
import { languageName } from "@/config/languages";
import { ArrowLeft, Send, Loader2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TOPICS = [
  {
    id: "remote-work",
    title: "Remote Work",
    forPosition: "Remote work is better than office work",
    againstPosition: "Office work is better than remote work",
    emoji: "🏠",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    id: "social-media",
    title: "Social Media",
    forPosition: "Social media has improved society",
    againstPosition: "Social media has harmed society",
    emoji: "📱",
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  },
  {
    id: "ai-jobs",
    title: "AI & Jobs",
    forPosition: "AI will create more jobs than it destroys",
    againstPosition: "AI will destroy more jobs than it creates",
    emoji: "🤖",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    id: "city-countryside",
    title: "City vs Countryside",
    forPosition: "Living in a city is better than the countryside",
    againstPosition: "Living in the countryside is better than the city",
    emoji: "🏙️",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  {
    id: "fast-food",
    title: "Fast Food",
    forPosition: "Fast food is acceptable as part of a modern diet",
    againstPosition: "Fast food is harmful and should be discouraged",
    emoji: "🍔",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  {
    id: "university",
    title: "University Education",
    forPosition: "A university degree is essential for success",
    againstPosition: "A university degree is no longer worth the cost",
    emoji: "🎓",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  {
    id: "pets",
    title: "Cats vs Dogs",
    forPosition: "Dogs are better pets than cats",
    againstPosition: "Cats are better pets than dogs",
    emoji: "🐾",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  {
    id: "space",
    title: "Space Exploration",
    forPosition: "Space exploration is worth the investment",
    againstPosition: "Space exploration money should be spent on Earth problems",
    emoji: "🚀",
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  },
];

type Side = "for" | "against";

export default function DebatePage() {
  const [selected, setSelected] = useState<(typeof TOPICS)[number] | null>(null);
  const [side, setSide] = useState<Side | null>(null);
  const [input, setInput] = useState("");
  const session = useLearningSession();
  const targetLang = session.targetLanguage ?? "en";
  const nativeLang = session.nativeLanguage ?? "en";

  const myPosition = selected && side ? (side === "for" ? selected.forPosition : selected.againstPosition) : "";
  const aiPosition = selected && side ? (side === "for" ? selected.againstPosition : selected.forPosition) : "";

  const { messages, isLoading, append, stop } = useChat({
    api: "/api/ai/chat",
    body: {
      mode: "debate",
      level: session.level,
      nativeLanguage: languageName(nativeLang),
      targetLanguage: languageName(targetLang),
      debateHint: `The learner argues: "${myPosition}". You argue the opposite: "${aiPosition}". Stay firm but be respectful.`,
    },
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    append({ role: "user", content: text });
  };

  if (!selected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Debate</h1>
          <p className="mt-1 text-muted-foreground">
            Argue your point of view against the AI. Practice persuasive language and critical thinking.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="group flex flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={cn("flex size-10 items-center justify-center rounded-xl border text-xl", t.color)}>
                {t.emoji}
              </div>
              <div>
                <p className="font-semibold text-sm">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.forPosition}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!side) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to topics
        </button>
        <div className="max-w-lg mx-auto space-y-4 pt-4">
          <div className="text-center">
            <span className="text-4xl">{selected.emoji}</span>
            <h2 className="mt-3 font-display text-xl font-bold">{selected.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose your side</p>
          </div>
          <button
            onClick={() => setSide("for")}
            className="w-full rounded-2xl border-2 border-green-500/20 bg-green-500/5 p-4 text-left hover:border-green-500/40 hover:bg-green-500/10 transition-all"
          >
            <p className="font-semibold text-green-600 dark:text-green-400 text-sm mb-1">✅ I argue FOR</p>
            <p className="text-sm">{selected.forPosition}</p>
          </button>
          <button
            onClick={() => setSide("against")}
            className="w-full rounded-2xl border-2 border-red-500/20 bg-red-500/5 p-4 text-left hover:border-red-500/40 hover:bg-red-500/10 transition-all"
          >
            <p className="font-semibold text-red-600 dark:text-red-400 text-sm mb-1">❌ I argue AGAINST</p>
            <p className="text-sm">{selected.againstPosition}</p>
          </button>
        </div>
      </div>
    );
  }

  const debateMessages = messages.filter((m) => m.role !== "system");

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <button
          onClick={() => { setSelected(null); setSide(null); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Change topic
        </button>
        <div className="h-4 w-px bg-border" />
        <span className="text-lg">{selected.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{selected.title}</p>
          <p className="text-xs text-muted-foreground truncate">You: {myPosition}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
          <Flame className="size-3.5" />
          Debate mode
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border bg-card/50 p-4 space-y-3">
        {debateMessages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <span className="text-5xl">{selected.emoji}</span>
            <div>
              <p className="font-medium text-foreground">Ready to debate?</p>
              <p className="text-sm mt-1">State your opening argument to begin.</p>
              <p className="text-xs mt-1 opacity-60">The AI will argue the opposite position.</p>
            </div>
          </div>
        )}
        {debateMessages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm",
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Make your argument..."
          className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          disabled={isLoading}
        />
        {isLoading ? (
          <Button variant="outline" size="icon" onClick={stop} className="shrink-0 size-10 rounded-xl">
            <span className="size-3 rounded-sm bg-foreground" />
          </Button>
        ) : (
          <Button onClick={handleSend} disabled={!input.trim()} size="icon" className="shrink-0 size-10 rounded-xl">
            <Send className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
