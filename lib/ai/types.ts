import { z } from "zod";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const CONVERSATION_MODES = [
  "casual",
  "business",
  "travel",
  "interview",
  "pronunciation",
  "grammar",
  "roleplay",
  "debate",
] as const;
export type ConversationMode = (typeof CONVERSATION_MODES)[number];

export type ModelTier = "default" | "premium";

/** Shared chat message shape across the app (maps to ai_messages rows). */
export const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

/** Context that personalizes every AI interaction. */
export interface LearningContext {
  nativeLanguage: string; // e.g. "Georgian"
  targetLanguage: string; // e.g. "English"
  level: CefrLevel;
  mode: ConversationMode;
}
