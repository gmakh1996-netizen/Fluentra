import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getModel } from "@/lib/ai";
import { WRITING_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { requireUser } from "@/lib/auth";
import { consumeUsage } from "@/lib/usage";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  text: z.string().min(1).max(5000),
  type: z.enum(["essay", "email", "job_application", "message", "social_post"]),
  tone: z.enum(["formal", "friendly", "confident", "concise"]).optional(),
  targetLanguage: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await consumeUsage(user.id, "ai_messages", 1);
    const { text, type, tone, targetLanguage } = bodySchema.parse(await req.json());

    const { object } = await generateObject({
      model: getModel("premium"),
      system: WRITING_SYSTEM_PROMPT(targetLanguage),
      schema: z.object({
        corrected: z.string(),
        suggestions: z.array(z.string()),
        vocabularyUpgrades: z.array(z.object({ from: z.string(), to: z.string() })),
      }),
      prompt: `Type: ${type}. Desired tone: ${tone ?? "keep original"}.\n\n${text}`,
    });
    return NextResponse.json(object);
  } catch (err) {
    return toErrorResponse(err);
  }
}
