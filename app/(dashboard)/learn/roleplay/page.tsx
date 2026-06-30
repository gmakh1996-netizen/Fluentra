"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { useLearningSession } from "@/stores/learning-session";
import { languageName } from "@/config/languages";
import {
  ShoppingBag, UtensilsCrossed, BriefcaseBusiness, Hotel,
  Stethoscope, Plane, MapPin, Users, ArrowLeft, Send, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SCENARIOS = [
  {
    id: "restaurant",
    title: "At the Restaurant",
    description: "Order food, ask about the menu, handle dietary requests",
    icon: UtensilsCrossed,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    systemHint: "You are a friendly waiter at a mid-range restaurant. The learner is the customer.",
  },
  {
    id: "job-interview",
    title: "Job Interview",
    description: "Practice answering interview questions confidently",
    icon: BriefcaseBusiness,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    systemHint: "You are a professional HR interviewer for a tech company. The learner is the candidate.",
  },
  {
    id: "hotel",
    title: "Hotel Check-in",
    description: "Check in, request amenities, handle issues",
    icon: Hotel,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    systemHint: "You are a hotel receptionist. The learner is checking in for a 3-night stay.",
  },
  {
    id: "doctor",
    title: "Doctor Visit",
    description: "Describe symptoms, understand medical advice",
    icon: Stethoscope,
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    systemHint: "You are a calm, reassuring general practitioner. The learner is a patient describing symptoms.",
  },
  {
    id: "shopping",
    title: "Shopping",
    description: "Find items, ask for sizes, negotiate prices",
    icon: ShoppingBag,
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    systemHint: "You are a helpful shop assistant in a clothing store. The learner is a customer.",
  },
  {
    id: "airport",
    title: "At the Airport",
    description: "Check-in, security, boarding, lost luggage",
    icon: Plane,
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    systemHint: "You are an airline check-in agent. The learner is a passenger checking in for a flight.",
  },
  {
    id: "directions",
    title: "Asking Directions",
    description: "Navigate a city, ask locals for help",
    icon: MapPin,
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    systemHint: "You are a local pedestrian in a busy city. The learner is a tourist who is lost.",
  },
  {
    id: "meeting",
    title: "Meeting Someone New",
    description: "Small talk, introductions, social situations",
    icon: Users,
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    systemHint: "You are a friendly local attending a networking event. The learner is meeting you for the first time.",
  },
];

export default function RoleplayPage() {
  const [selected, setSelected] = useState<(typeof SCENARIOS)[number] | null>(null);
  const [input, setInput] = useState("");
  const session = useLearningSession();
  const targetLang = session.targetLanguage ?? "en";
  const nativeLang = session.nativeLanguage ?? "en";

  const { messages, isLoading, append, stop } = useChat({
    api: "/api/ai/chat",
    body: {
      mode: "roleplay",
      level: session.level,
      nativeLanguage: languageName(nativeLang),
      targetLanguage: languageName(targetLang),
      scenarioHint: selected?.systemHint,
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
          <h1 className="font-display text-2xl font-bold tracking-tight">Roleplay</h1>
          <p className="mt-1 text-muted-foreground">
            Practice real-life conversations in realistic scenarios. Pick a situation to start.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="group flex flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={cn("flex size-10 items-center justify-center rounded-xl border", s.color)}>
                <s.icon className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const scenarioMessages = messages.filter((m) => m.role !== "system");

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Change scenario
        </button>
        <div className="h-4 w-px bg-border" />
        <div className={cn("flex size-7 items-center justify-center rounded-lg border", selected.color)}>
          <selected.icon className="size-3.5" />
        </div>
        <span className="font-semibold text-sm">{selected.title}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border bg-card/50 p-4 space-y-3">
        {scenarioMessages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <div className={cn("flex size-12 items-center justify-center rounded-2xl border", selected.color)}>
              <selected.icon className="size-6" />
            </div>
            <div>
              <p className="font-medium text-foreground">{selected.title}</p>
              <p className="text-sm mt-0.5">{selected.description}</p>
              <p className="text-xs mt-3 text-muted-foreground/70">Say something to start the scene...</p>
            </div>
          </div>
        )}
        {scenarioMessages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
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
          placeholder="Type your response..."
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
