"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import type { Message } from "ai";
import { useLearningSession } from "@/stores/learning-session";
import { languageName } from "@/config/languages";
import type { CefrLevel, ConversationMode } from "@/lib/ai/types";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ChatSettings } from "./chat-settings";
import { GrammarPanel } from "./grammar-panel";

interface ChatInterfaceProps {
  initialMessages: Message[];
}

export function ChatInterface({ initialMessages }: ChatInterfaceProps) {
  const session = useLearningSession();

  // Controlled input so we can inject voice transcription
  const [inputValue, setInputValue] = useState("");
  const [grammarText, setGrammarText] = useState<string | null>(null);

  const targetLang = session.targetLanguage ?? "en";
  const nativeLang = session.nativeLanguage ?? "en";
  const targetName = languageName(targetLang);
  const nativeName = languageName(nativeLang);

  const { messages, isLoading, append, stop } = useChat({
    api: "/api/ai/chat",
    initialMessages,
    body: {
      mode: session.mode,
      level: session.level,
      nativeLanguage: nativeName,
      targetLanguage: targetName,
    },
    onError(_err) {
      // errors surface via the UI; suppress noisy console output in production
    },
  });

  const handleSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    append({ role: "user", content: text });
  };

  return (
    <div className="flex gap-6 items-start">
      {/* Main chat column */}
      <div className="flex flex-1 flex-col gap-4 min-w-0">
        {/* Message list */}
        <div className="flex flex-col min-h-[32rem] rounded-xl border bg-card/50 px-4 overflow-y-auto">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            targetLanguage={targetName}
            nativeLanguage={nativeName}
            onGrammarCheck={setGrammarText}
          />
        </div>

        {/* Grammar panel */}
        {grammarText !== null && (
          <GrammarPanel
            text={grammarText}
            targetLanguage={targetName}
            nativeLanguage={nativeName}
            onClose={() => setGrammarText(null)}
            onUseCorrection={(corrected) => {
              setInputValue(corrected);
              setGrammarText(null);
            }}
          />
        )}

        {/* Input */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onGrammarCheck={setGrammarText}
          isLoading={isLoading}
          targetLanguage={targetLang}
        />

        {isLoading && (
          <div className="flex justify-end">
            <button
              onClick={() => stop()}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Stop generating
            </button>
          </div>
        )}
      </div>

      {/* Settings sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <ChatSettings
          targetLanguage={targetLang}
          nativeLanguage={nativeLang}
          level={session.level}
          mode={session.mode}
          onTargetChange={(v) =>
            session.setLanguages(nativeLang, v)
          }
          onNativeChange={(v) =>
            session.setLanguages(v, targetLang)
          }
          onLevelChange={(v) => session.setLevel(v as CefrLevel)}
          onModeChange={(v) => session.setMode(v as ConversationMode)}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
