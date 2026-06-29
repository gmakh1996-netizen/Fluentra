import "server-only";
import { env } from "@/lib/env";

export interface PronunciationScore {
  accuracy: number; // 0–100
  fluency: number; // 0–100
  completeness: number; // 0–100
  confidence: number; // 0–100
  /** Per-word/phoneme breakdown when the provider supports it. */
  phonemes: Array<{ symbol: string; score: number }>;
  tips: string[];
  /** True when scores are real phoneme assessment, false for the AI fallback. */
  graded: boolean;
}

export interface PronunciationProvider {
  readonly name: string;
  assess(audio: ArrayBuffer, referenceText: string, language: string): Promise<PronunciationScore>;
}

/**
 * Selects the scoring backend at runtime:
 *  - Azure Pronunciation Assessment when AZURE_SPEECH_KEY is set (real scores)
 *  - otherwise an AI-commentary fallback (no numeric phoneme scores)
 *
 * Both implementations live in azure.ts and fallback.ts; this module is the
 * only place that decides which one to use, so callers stay agnostic.
 */
export async function getPronunciationProvider(): Promise<PronunciationProvider> {
  if (env.AZURE_SPEECH_KEY && env.AZURE_SPEECH_REGION) {
    const { AzurePronunciationProvider } = await import("./azure");
    return new AzurePronunciationProvider();
  }
  const { FallbackPronunciationProvider } = await import("./fallback");
  return new FallbackPronunciationProvider();
}
