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
  text: z.string().min(1).max(1000),
  fromLanguage: z.string().min(1),
  toLanguage: z.string().min(1),
});

const resultSchema = z.object({
  translation: z.string(),
  romanization: z.string().optional(),
  notes: z.string().optional(),
});

let limiterPromise: ReturnType<typeof createRateLimiter> | null = null;
const limiter = () => (limiterPromise ??= createRateLimiter(30, 60));

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const rl = await (await limiter())(user.id);
    if (!rl.success) throw new ApiError("rate_limited", "Slow down a moment.", 429);

    await consumeUsage(user.id, "ai_messages", 1);

    const { text, fromLanguage, toLanguage } = bodySchema.parse(await req.json());

    const { object } = await generateObject({
      model: getModel("default"),
      system: `You are a precise language translator. Translate text from ${fromLanguage} to ${toLanguage}. ` +
        `Return the translation, an optional romanization (only for non-Latin scripts like Japanese, Chinese, Arabic, Korean, Georgian), ` +
        `and an optional brief note if there is important context or nuance to know.`,
      schema: resultSchema,
      prompt: text,
    });

    return NextResponse.json(object);
  } catch (err) {
    return toErrorResponse(err);
  }
}
