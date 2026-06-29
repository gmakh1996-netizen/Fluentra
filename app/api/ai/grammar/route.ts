import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { GRAMMAR_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { requireUser } from "@/lib/auth";
import { consumeUsage } from "@/lib/usage";
import { toErrorResponse } from "@/lib/errors";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const bodySchema = z.object({
  text: z.string().min(1).max(2000),
  targetLanguage: z.string().min(1),
  nativeLanguage: z.string().min(1),
});

const correctionSchema = z.object({
  corrected: z.string(),
  mistakes: z.array(
    z.object({
      original: z.string(),
      correction: z.string(),
      explanation: z.string(),
    }),
  ),
  alternatives: z.array(z.string()).length(3),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await consumeUsage(user.id, "ai_messages", 1);

    const { text, targetLanguage, nativeLanguage } = bodySchema.parse(await req.json());

    const { object } = await generateObject({
      model: getModel("premium"),
      system: GRAMMAR_SYSTEM_PROMPT(targetLanguage, nativeLanguage),
      schema: correctionSchema,
      prompt: text,
    });

    return NextResponse.json(object);
  } catch (err) {
    return toErrorResponse(err);
  }
}
