"use client";

import { useRef, useState } from "react";
import { Copy, Check, Languages, SpellCheck, Sparkles } from "lucide-react";
import type { Message } from "ai";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "./markdown-content";
import { WordActionsPopover } from "./word-actions-popover";

interface ChatMessageProps {
  message: Message;
  targetLanguage: string;
  nativeLanguage: string;
  onGrammarCheck: (text: string) => void;
}

export function ChatMessage({
  message,
  targetLanguage,
  nativeLanguage,
  onGrammarCheck,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUser = message.role === "user";

  const copyText = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className={cn("group flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-brand-gradient text-white",
        )}
      >
        {isUser ? "You" : <Sparkles className="size-4" />}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[80%] space-y-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "rounded-tr-sm bg-secondary text-secondary-foreground"
              : "rounded-tl-sm border bg-card",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div ref={containerRef} className="relative">
              <MarkdownContent content={message.content} />
              <WordActionsPopover
                containerRef={containerRef}
                targetLanguage={targetLanguage}
                nativeLanguage={nativeLanguage}
              />
            </div>
          )}
        </div>

        {/* Action row */}
        <div
          className={cn(
            "flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100",
            isUser ? "flex-row-reverse" : "flex-row",
          )}
        >
          <button
            onClick={copyText}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </button>

          {!isUser && (
            <>
              <button
                onClick={() => onGrammarCheck(message.content)}
                className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <SpellCheck className="size-3" />
                Grammar
              </button>
            </>
          )}

          {isUser && (
            <button
              onClick={() => onGrammarCheck(message.content)}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <SpellCheck className="size-3" />
              Check grammar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
