import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getModel } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { consumeUsage } from "@/lib/usage";
import { createRateLimiter } from "@/lib/rate-limit";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  word: z.string().min(1).max(200),
  context: z.string().max(500).optional(),
  targetLanguage: z.string().min(1),
  nativeLanguage: z.string().min(1),
});

const resultSchema = z.object({
  term: z.string(),
  partOfSpeech: z.string(),
  definition: z.string(),
  examples: z.array(z.string()).min(1).max(3),
  synonyms: z.array(z.string()).max(4),
  tip: z.string().optional(),
});

let limiterPromise: ReturnType<typeof createRateLimiter> | null = null;
const limiter = () => (limiterPromise ??= createRateLimiter(30, 60));

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const rl = await (await limiter())(user.id);
    if (!rl.success) throw new ApiError("rate_limited", "Slow down a moment.", 429);

    await consumeUsage(user.id, "ai_messages", 1);

    const { word, context, targetLanguage, nativeLanguage } = bodySchema.parse(await req.json());

    const { object } = await generateObject({
      model: getModel("default"),
      system: `You are a ${targetLanguage} vocabulary teacher. The learner's native language is ${nativeLanguage}. ` +
        `Explain the given word or phrase clearly and concisely. ` +
        `Include part of speech, a simple definition in ${nativeLanguage}, ` +
        `1-3 example sentences in ${targetLanguage}, up to 4 synonyms, ` +
        `and an optional learning tip.`,
      schema: resultSchema,
      prompt: context ? `Word: "${word}"\nContext: "${context}"` : `Word: "${word}"`,
    });

    return NextResponse.json(object);
  } catch (err) {
    return toErrorResponse(err);
  }
}
