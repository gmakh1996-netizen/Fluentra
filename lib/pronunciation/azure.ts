import "server-only";
import { env } from "@/lib/env";
import type { PronunciationProvider, PronunciationScore } from "./index";

/**
 * Azure Cognitive Services — Pronunciation Assessment.
 * Sends the recorded audio with the reference text and maps Azure's response
 * to our PronunciationScore shape. Wiring the exact REST/SDK call is a Phase 5
 * task; the contract and config access are fixed here.
 */
export class AzurePronunciationProvider implements PronunciationProvider {
  readonly name = "azure";

  async assess(
    audio: ArrayBuffer,
    referenceText: string,
    language: string,
  ): Promise<PronunciationScore> {
    const key = env.AZURE_SPEECH_KEY!;
    const region = env.AZURE_SPEECH_REGION!;
    void key;
    void region;
    void audio;
    void referenceText;
    void language;
    throw new Error(
      "Azure pronunciation assessment is wired in Phase 5. " +
        "Implement the Speech SDK call here and map accuracy/fluency/completeness/phonemes.",
    );
  }
}
