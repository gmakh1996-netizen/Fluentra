"use client";

import { useEffect, useRef } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import type { Message } from "ai";
import { ChatMessage } from "./chat-message";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  targetLanguage: string;
  nativeLanguage: string;
  onGrammarCheck: (text: string) => void;
}

export function ChatMessages({
  messages,
  isLoading,
  targetLanguage,
  nativeLanguage,
  onGrammarCheck,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center py-16">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
          <MessageSquare className="size-7" />
        </div>
        <div>
          <p className="font-semibold">Start a conversation</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Type a message or speak to your AI tutor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 py-4">
      {messages.map((m) => (
        <ChatMessage
          key={m.id}
          message={m}
          targetLanguage={targetLanguage}
          nativeLanguage={nativeLanguage}
          onGrammarCheck={onGrammarCheck}
        />
      ))}

      {isLoading && (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
            <Loader2 className="size-4 animate-spin" />
          </div>
          <span className="text-sm text-muted-foreground">Fluentra is thinking…</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
