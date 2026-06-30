"use client";

import * as React from "react";
import { toast } from "sonner";
import type { CefrLevel, ConversationMode } from "@/lib/ai/types";
import type { PronunciationScore } from "@/lib/pronunciation";
import { DEFAULT_VOICE_ID } from "@/config/voices";
import { useMediaRecorder } from "@/hooks/use-media-recorder";

export type VoiceStatus =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "speaking";

export interface Turn {
  id: string;
  role: "user" | "assistant";
  text: string;
  audioUrl?: string;
  score?: PronunciationScore;
  scoring?: boolean;
}

export interface VoiceSettings {
  targetCode: string;
  targetName: string;
  nativeName: string;
  level: CefrLevel;
  mode: ConversationMode;
  voiceId: string;
  speed: number;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  targetCode: "en",
  targetName: "English",
  nativeName: "English",
  level: "A2",
  mode: "casual",
  voiceId: DEFAULT_VOICE_ID,
  speed: 1,
};

/** Parse our standard `{ error: { message } }` envelope from a failed Response. */
async function failure(res: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    if (body?.error?.message) message = body.error.message;
  } catch {
    /* keep fallback */
  }
  throw new Error(message);
}

async function apiTranscribe(blob: Blob, language: string): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "speech.webm");
  form.append("language", language);
  const res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
  if (!res.ok) await failure(res, "Speech recognition failed.");
  const data = (await res.json()) as { text: string };
  return data.text;
}

async function apiConverse(payload: unknown): Promise<string> {
  const res = await fetch("/api/voice/converse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await failure(res, "The tutor couldn't respond.");
  const data = (await res.json()) as { reply: string };
  return data.reply;
}

async function apiAssess(
  blob: Blob,
  referenceText: string,
  language: string,
): Promise<PronunciationScore> {
  const form = new FormData();
  form.append("file", blob, "speech.webm");
  form.append("referenceText", referenceText);
  form.append("language", language);
  const res = await fetch("/api/voice/assess", { method: "POST", body: form });
  if (!res.ok) await failure(res, "Scoring failed.");
  return (await res.json()) as PronunciationScore;
}

async function apiTts(text: string, voiceId: string, speed: number): Promise<string> {
  const res = await fetch("/api/voice/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId, speed }),
  });
  if (!res.ok) await failure(res, "Voice playback unavailable.");
  const buf = await res.arrayBuffer();
  return URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
}

let counter = 0;
const nextId = () => `turn_${Date.now()}_${counter++}`;

/**
 * Drives a turn-based spoken conversation:
 * record → transcribe (STT) → tutor reply (AI) → speak (TTS), with
 * pronunciation scoring running in parallel and attached to the user's turn.
 */
export function useVoiceConversation(initial?: Partial<VoiceSettings>) {
  const recorder = useMediaRecorder();
  const [status, setStatus] = React.useState<VoiceStatus>("idle");
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [settings, setSettings] = React.useState<VoiceSettings>({
    ...DEFAULT_SETTINGS,
    ...initial,
  });
  const [voiceAvailable, setVoiceAvailable] = React.useState(true);

  const turnsRef = React.useRef<Turn[]>([]);
  const settingsRef = React.useRef(settings);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  settingsRef.current = settings;

  const setTurnsSynced = React.useCallback((updater: (prev: Turn[]) => Turn[]) => {
    setTurns((prev) => {
      const next = updater(prev);
      turnsRef.current = next;
      return next;
    });
  }, []);

  const patchTurn = React.useCallback(
    (id: string, patch: Partial<Turn>) =>
      setTurnsSynced((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [setTurnsSynced],
  );

  const getAudio = React.useCallback(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current;
  }, []);

  const play = React.useCallback(
    (url: string) =>
      new Promise<void>((resolve) => {
        const audio = getAudio();
        audio.src = url;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      }),
    [getAudio],
  );

  const replay = React.useCallback(
    (turn: Turn) => {
      if (turn.audioUrl) void play(turn.audioUrl);
    },
    [play],
  );

  const runTurn = React.useCallback(async () => {
    const rec = await recorder.stop();
    const s = settingsRef.current;

    if (!rec || rec.durationMs < 400) {
      setStatus("idle");
      if (rec) toast.message("That was too short — hold the button and speak.");
      return;
    }

    try {
      setStatus("transcribing");
      const text = await apiTranscribe(rec.blob, s.targetCode);
      if (!text) {
        toast.error("Didn't catch that. Try again a little louder.");
        setStatus("idle");
        return;
      }

      const userTurn: Turn = {
        id: nextId(),
        role: "user",
        text,
        audioUrl: URL.createObjectURL(rec.blob),
        scoring: true,
      };

      // Snapshot history BEFORE the React state update so we can build the
      // messages array immediately — React 18 batches the setter and the ref
      // won't be updated until the next render.
      const historySnapshot = turnsRef.current.slice();
      setTurnsSynced((prev) => [...prev, userTurn]);

      // Pronunciation scoring runs alongside the tutor's reply.
      void apiAssess(rec.blob, text, s.targetCode)
        .then((score) => patchTurn(userTurn.id, { score, scoring: false }))
        .catch(() => patchTurn(userTurn.id, { scoring: false }));

      setStatus("thinking");
      const messages = [
        ...historySnapshot.map((t) => ({ role: t.role, content: t.text })),
        { role: "user" as const, content: text },
      ];
      const reply = await apiConverse({
        messages,
        mode: s.mode,
        level: s.level,
        nativeLanguage: s.nativeName,
        targetLanguage: s.targetName,
      });

      const aiTurn: Turn = { id: nextId(), role: "assistant", text: reply };
      setTurnsSynced((prev) => [...prev, aiTurn]);

      // Speak the reply; degrade gracefully if TTS is gated/unconfigured.
      setStatus("speaking");
      try {
        const url = await apiTts(reply, s.voiceId, s.speed);
        patchTurn(aiTurn.id, { audioUrl: url });
        await play(url);
      } catch (e) {
        setVoiceAvailable(false);
        toast.message("Showing the reply as text — voice playback isn't available.", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
      setStatus("idle");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("idle");
    }
  }, [recorder, setTurnsSynced, patchTurn, play]);

  const toggle = React.useCallback(async () => {
    if (status === "recording") {
      void runTurn();
      return;
    }
    if (status !== "idle") return; // busy (transcribing/thinking/speaking)
    const ok = await recorder.start();
    if (ok) setStatus("recording");
  }, [status, recorder, runTurn]);

  const clear = React.useCallback(() => {
    turnsRef.current.forEach((t) => t.audioUrl && URL.revokeObjectURL(t.audioUrl));
    setTurnsSynced(() => []);
  }, [setTurnsSynced]);

  // Release object URLs on unmount.
  React.useEffect(
    () => () => turnsRef.current.forEach((t) => t.audioUrl && URL.revokeObjectURL(t.audioUrl)),
    [],
  );

  return {
    status,
    turns,
    settings,
    setSettings,
    level: recorder.level,
    isSupported: recorder.isSupported,
    micError: recorder.error,
    voiceAvailable,
    toggle,
    replay,
    clear,
    busy: status !== "idle" && status !== "recording",
  };
}
