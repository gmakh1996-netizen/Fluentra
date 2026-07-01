import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModelV1 } from "ai";
import { env } from "@/lib/env";
import type { ModelTier } from "./types";

/**
 * Single seam between the app and any LLM vendor. Every AI route calls
 * `getModel(tier)` and then uses the Vercel AI SDK (`streamText`,
 * `generateObject`, …). Swapping providers is a one-line config change here.
 *
 * Fallback rule: AI_PROVIDER=openai is used when OPENAI_API_KEY is present.
 * If the key is absent the app silently falls back to Gemini, so the only
 * thing needed to activate OpenAI is adding OPENAI_API_KEY to .env.local.
 */
function resolveProvider(): "openai" | "gemini" {
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) return "openai";
  return "gemini";
}

function model(tier: ModelTier): LanguageModelV1 {
  if (resolveProvider() === "openai") {
    const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY! });
    return openai(tier === "premium" ? env.OPENAI_MODEL_PREMIUM : env.OPENAI_MODEL_DEFAULT);
  }

  if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      env.AI_PROVIDER === "openai"
        ? "Add OPENAI_API_KEY to use OpenAI, or add GOOGLE_GENERATIVE_AI_API_KEY for the Gemini fallback."
        : "AI_PROVIDER=gemini but GOOGLE_GENERATIVE_AI_API_KEY is not set.",
    );
  }
  const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });
  return google(tier === "premium" ? env.GEMINI_MODEL_PREMIUM : env.GEMINI_MODEL_DEFAULT);
}

export function getModel(tier: ModelTier = "default"): LanguageModelV1 {
  return model(tier);
}

/** The provider that will actually handle requests at runtime. */
export const activeProvider = resolveProvider();
