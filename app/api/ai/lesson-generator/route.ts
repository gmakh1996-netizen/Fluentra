import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getModel } from "@/lib/ai";
import { requireAdmin } from "@/lib/auth";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

// Admin-only: generates structured lesson content for the content library.
const bodySchema = z.object({
  category: z.string().min(1),
  targetLanguage: z.string().min(1),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { category, targetLanguage, level } = bodySchema.parse(await req.json());

    const { object } = await generateObject({
      model: getModel("premium"),
      schema: z.object({
        title: z.string(),
        description: z.string(),
        durationMinutes: z.number().int(),
        xpReward: z.number().int(),
        steps: z.array(
          z.object({
            type: z.enum(["content", "exercise", "prompt"]),
            title: z.string(),
            body: z.string(),
          }),
        ),
      }),
      prompt: `Create a ${level} ${targetLanguage} lesson in the "${category}" category with 4-7 steps.`,
    });
    return NextResponse.json(object);
  } catch (err) {
    return toErrorResponse(err);
  }
}
