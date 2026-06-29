import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getModel } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { consumeUsage } from "@/lib/usage";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  topic:          z.string().min(1).max(100),
  language:       z.string().min(1),
  nativeLanguage: z.string().min(1),
  level:          z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await consumeUsage(user.id, "ai_messages", 1);
    const { topic, language, nativeLanguage, level } = bodySchema.parse(await req.json());

    const { object } = await generateObject({
      model: getModel("default"),
      prompt: `Write a short listening-exercise passage in ${language} at ${level} CEFR level about "${topic}".
Use vocabulary appropriate for that level. Keep it 80–130 words across 2–3 short paragraphs.
Also write a title for the passage and 3 multiple-choice comprehension questions in ${nativeLanguage}.
Each question must have exactly 4 answer options; mark the correct one by its 0-based index.`,
      schema: z.object({
        title: z.string(),
        passage: z.string(),
        questions: z.array(
          z.object({
            question:     z.string(),
            options:      z.array(z.string()).length(4),
            correctIndex: z.number().int().min(0).max(3),
          }),
        ).length(3),
      }),
    });

    return NextResponse.json(object);
  } catch (err) {
    return toErrorResponse(err);
  }
}
