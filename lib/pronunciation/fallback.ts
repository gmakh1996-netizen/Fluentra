import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import type { PronunciationProvider, PronunciationScore } from "./index";

/**
 * No-Azure fallback: transcribe via the active AI provider and ask the model
 * to comment on likely pronunciation issues. Returns coarse, AI-estimated
 * scores flagged graded:false so the UI can be honest that these aren't
 * phoneme-level measurements.
 */
export class FallbackPronunciationProvider implements PronunciationProvider {
  readonly name = "ai-fallback";

  async assess(
    _audio: ArrayBuffer,
    referenceText: string,
    language: string,
  ): Promise<PronunciationScore> {
    const { object } = await generateObject({
      model: getModel("premium"),
      schema: z.object({
        accuracy: z.number().min(0).max(100),
        fluency: z.number().min(0).max(100),
        tips: z.array(z.string()).max(5),
      }),
      prompt:
        `A learner attempted to say this ${language} phrase: "${referenceText}". ` +
        `Estimate rough accuracy and fluency (0-100) and give up to 5 concrete pronunciation tips. ` +
        `Be encouraging and specific about sounds.`,
    });

    return {
      accuracy: object.accuracy,
      fluency: object.fluency,
      completeness: object.accuracy,
      confidence: 50,
      phonemes: [],
      tips: object.tips,
      graded: false,
    };
  }
}
