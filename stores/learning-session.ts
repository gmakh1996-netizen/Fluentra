import { create } from "zustand";
import type { CefrLevel, ConversationMode } from "@/lib/ai/types";

/**
 * Ephemeral client state for an active learning session. Persistent data
 * (history, progress, vocabulary) lives in Supabase and is read via TanStack
 * Query — Zustand only holds transient UI/session state that doesn't belong
 * in the database or the URL.
 */
interface LearningSessionState {
  targetLanguage: string | null;
  nativeLanguage: string | null;
  level: CefrLevel;
  mode: ConversationMode;
  isRecording: boolean;
  setLanguages: (native: string, target: string) => void;
  setLevel: (level: CefrLevel) => void;
  setMode: (mode: ConversationMode) => void;
  setRecording: (v: boolean) => void;
  reset: () => void;
}

const initial = {
  targetLanguage: null,
  nativeLanguage: null,
  level: "A1" as CefrLevel,
  mode: "casual" as ConversationMode,
  isRecording: false,
};

export const useLearningSession = create<LearningSessionState>((set) => ({
  ...initial,
  setLanguages: (native, target) => set({ nativeLanguage: native, targetLanguage: target }),
  setLevel: (level) => set({ level }),
  setMode: (mode) => set({ mode }),
  setRecording: (isRecording) => set({ isRecording }),
  reset: () => set(initial),
}));
