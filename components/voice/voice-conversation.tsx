"use client";

import * as React from "react";
import { Mic, Square, Trash2, AudioLines, MicOff } from "lucide-react";
import { useVoiceConversation, type VoiceStatus } from "@/hooks/use-voice-conversation";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { LiveWaveform } from "@/components/voice/live-waveform";
import { VoiceMessage } from "@/components/voice/voice-message";
import { VoiceControls } from "@/components/voice/voice-controls";
import { PronunciationScorePanel } from "@/components/voice/pronunciation-score";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<VoiceStatus, string> = {
  idle: "Tap the mic to speak",
  recording: "Listening…",
  transcribing: "Transcribing…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};

const MIC_ERRORS: Record<string, string> = {
  permission: "Microphone access was blocked. Enable it in your browser settings and reload.",
  "no-device": "No microphone found. Connect one and try again.",
  unsupported: "Your browser doesn’t support audio recording. Try a recent Chrome, Edge or Safari.",
  failed: "Couldn’t start recording. Check your microphone and try again.",
};

export function VoiceConversation() {
  const vc = useVoiceConversation();
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [vc.turns.length, vc.status]);

  const recording = vc.status === "recording";
  const latestScored = [...vc.turns].reverse().find((t) => t.role === "user" && (t.score || t.scoring));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Conversation */}
      <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm lg:h-[calc(100dvh-12rem)]">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {vc.turns.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <AudioLines className="size-7" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold">Start a voice conversation</p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                  Tap the mic and say hello in {vc.settings.targetName}. Your tutor listens, replies
                  aloud, and scores your pronunciation.
                </p>
              </div>
            </div>
          ) : (
            vc.turns.map((t) => <VoiceMessage key={t.id} turn={t} onReplay={vc.replay} />)
          )}
          <div ref={bottomRef} />
        </div>

        {/* Mic dock */}
        <div className="border-t bg-muted/30 p-5">
          {!vc.isSupported || vc.micError ? (
            <Alert variant="warning">
              <MicOff />
              <AlertTitle>Microphone unavailable</AlertTitle>
              <AlertDescription>
                {MIC_ERRORS[vc.micError ?? "unsupported"] ?? MIC_ERRORS.failed}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <LiveWaveform level={vc.level} active={recording} className="w-full max-w-xs" />

              <button
                onClick={vc.toggle}
                disabled={vc.busy}
                aria-label={recording ? "Stop recording" : "Start recording"}
                className={cn(
                  "grid size-16 place-items-center rounded-full text-white shadow-glow transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 disabled:opacity-60",
                  recording
                    ? "bg-destructive animate-pulse-ring"
                    : "bg-brand-gradient hover:brightness-110 active:scale-95",
                )}
              >
                {vc.busy ? (
                  <Spinner className="size-6 text-white" />
                ) : recording ? (
                  <Square className="size-6 fill-current" />
                ) : (
                  <Mic className="size-7" />
                )}
              </button>

              <p
                className="text-sm font-medium text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {STATUS_LABEL[vc.status]}
              </p>
              {!vc.voiceAvailable && (
                <p className="text-center text-xs text-muted-foreground">
                  Voice replies need an ElevenLabs key and a Pro plan — showing text for now.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Sidebar: settings + live feedback */}
      <aside className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Session & feedback
          </h2>
          {vc.turns.length > 0 && (
            <Button variant="ghost" size="sm" onClick={vc.clear} disabled={vc.busy}>
              <Trash2 className="size-4" /> Clear
            </Button>
          )}
        </div>
        <VoiceControls settings={vc.settings} onChange={(p) => vc.setSettings((s) => ({ ...s, ...p }))} disabled={vc.busy || recording} />
        <PronunciationScorePanel score={latestScored?.score} scoring={latestScored?.scoring} />
      </aside>
    </div>
  );
}
