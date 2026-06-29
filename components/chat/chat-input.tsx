"use client";

import { useRef, useState, useEffect, KeyboardEvent } from "react";
import { Send, Mic, MicOff, Square, Loader2, SpellCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMediaRecorder } from "@/hooks/use-media-recorder";

const MAX_CHARS = 2000;

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onGrammarCheck: (text: string) => void;
  isLoading: boolean;
  targetLanguage: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onGrammarCheck,
  isLoading,
  targetLanguage,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorder = useMediaRecorder();

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSubmit) handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit();
  };

  const toggleVoice = async () => {
    if (recorder.isRecording) {
      const recording = await recorder.stop();
      if (!recording) return;
      setIsTranscribing(true);
      try {
        const form = new FormData();
        form.append("file", recording.blob, `audio.${recording.mimeType.split("/")[1]?.split(";")[0] ?? "webm"}`);
        form.append("language", targetLanguage);
        const res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
        if (res.ok) {
          const { text } = await res.json();
          if (text) onChange(value ? `${value} ${text}` : text);
        }
      } finally {
        setIsTranscribing(false);
      }
    } else {
      await recorder.start();
    }
  };

  const tooLong = value.length > MAX_CHARS;
  const nearLimit = value.length > MAX_CHARS * 0.9;
  const canSubmit = value.trim().length > 0 && !isLoading && !tooLong && !recorder.isRecording;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative rounded-xl border bg-card shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-ring/40",
          tooLong && "border-destructive focus-within:ring-destructive/40",
        )}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your tutor… (⌘↵ to send)"
          disabled={isLoading || recorder.isRecording || isTranscribing}
          className="block w-full resize-none bg-transparent px-4 pt-3 pb-12 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
          style={{ minHeight: "52px", maxHeight: "160px" }}
        />

        {/* Bottom toolbar */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Voice button */}
            {recorder.isSupported && (
              <Button
                type="button"
                size="icon-sm"
                variant={recorder.isRecording ? "destructive" : "ghost"}
                onClick={toggleVoice}
                disabled={isLoading || isTranscribing}
                title={recorder.isRecording ? "Stop recording" : "Voice input"}
                className={cn(recorder.isRecording && "animate-pulse")}
              >
                {isTranscribing ? (
                  <Loader2 className="animate-spin" />
                ) : recorder.isRecording ? (
                  <Square className="size-3.5 fill-current" />
                ) : (
                  <Mic />
                )}
              </Button>
            )}

            {/* Grammar check */}
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => value.trim() && onGrammarCheck(value.trim())}
              disabled={!value.trim() || isLoading}
              title="Check grammar"
            >
              <SpellCheck />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {nearLimit && (
              <span className={cn("text-xs tabular-nums", tooLong ? "text-destructive" : "text-muted-foreground")}>
                {value.length}/{MAX_CHARS}
              </span>
            )}
            <Button
              type="button"
              size="icon-sm"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </div>
        </div>
      </div>

      {recorder.error && (
        <p className="text-xs text-muted-foreground px-1">
          {recorder.error === "permission"
            ? "Microphone permission denied."
            : recorder.error === "no-device"
            ? "No microphone found."
            : "Voice input unavailable."}
        </p>
      )}
    </div>
  );
}
