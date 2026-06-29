import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getModel } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { consumeUsage } from "@/lib/usage";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  topic: z.string().min(1),
  targetLanguage: z.string().min(1),
  nativeLanguage: z.string().min(1),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  count: z.number().int().min(1).max(20).default(10),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await consumeUsage(user.id, "ai_messages", 1);
    const { topic, targetLanguage, nativeLanguage, level, count } = bodySchema.parse(
      await req.json(),
    );

    const { object } = await generateObject({
      model: getModel("default"),
      schema: z.object({
        items: z.array(
          z.object({
            term: z.string(),
            translation: z.string(),
            example: z.string(),
          }),
        ),
      }),
      prompt:
        `Generate ${count} ${targetLanguage} vocabulary items about "${topic}" for a ${level} learner ` +
        `whose native language is ${nativeLanguage}. Each item: term, translation, and one natural example sentence.`,
    });
    return NextResponse.json(object);
  } catch (err) {
    return toErrorResponse(err);
  }
}
