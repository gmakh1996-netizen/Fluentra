import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModelV1 } from "ai";
import { env } from "@/lib/env";
import type { ModelTier } from "./types";

/**
 * Single seam between the app and any LLM vendor. Every AI route calls
 * `getModel(tier)` and then uses the Vercel AI SDK (`streamText`,
 * `generateObject`, …). Swapping or A/B-ing providers is a config change here,
 * never a change in feature code.
 */
function model(tier: ModelTier): LanguageModelV1 {
  if (env.AI_PROVIDER === "openai") {
    if (!env.OPENAI_API_KEY) {
      throw new Error("AI_PROVIDER=openai but OPENAI_API_KEY is not set.");
    }
    const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
    return openai(tier === "premium" ? env.OPENAI_MODEL_PREMIUM : env.OPENAI_MODEL_DEFAULT);
  }

  if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("AI_PROVIDER=gemini but GOOGLE_GENERATIVE_AI_API_KEY is not set.");
  }
  const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });
  return google(tier === "premium" ? env.GEMINI_MODEL_PREMIUM : env.GEMINI_MODEL_DEFAULT);
}

export function getModel(tier: ModelTier = "default"): LanguageModelV1 {
  return model(tier);
}

export const activeProvider = env.AI_PROVIDER;
