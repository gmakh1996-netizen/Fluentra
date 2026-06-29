import { generateText } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { buildVoiceTutorSystemPrompt } from "@/lib/ai/prompts";
import { chatMessageSchema, CONVERSATION_MODES, CEFR_LEVELS } from "@/lib/ai/types";
import { requireUser } from "@/lib/auth";
import { consumeUsage } from "@/lib/usage";
import { createRateLimiter } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  conversationId: z.string().uuid().optional(),
  messages: z.array(chatMessageSchema).min(1),
  mode: z.enum(CONVERSATION_MODES),
  level: z.enum(CEFR_LEVELS),
  nativeLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
});

let limiterPromise: ReturnType<typeof createRateLimiter> | null = null;
const limiter = () => (limiterPromise ??= createRateLimiter(30, 60));

/**
 * One spoken turn: takes the conversation so far and returns the tutor's reply
 * as plain text (the client then sends it to /api/voice/generate for TTS).
 * Non-streaming because the audio is synthesized from the complete reply.
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const rl = await (await limiter())(user.id);
    if (!rl.success) throw new ApiError("rate_limited", "Slow down a moment.", 429);

    await consumeUsage(user.id, "ai_messages", 1);

    const { messages, mode, level, nativeLanguage, targetLanguage } = bodySchema.parse(
      await req.json(),
    );

    const system = buildVoiceTutorSystemPrompt({ nativeLanguage, targetLanguage, level, mode });
    const tier = mode === "grammar" || mode === "interview" ? "premium" : "default";

    const { text } = await generateText({ model: getModel(tier), system, messages });

    // Best-effort persistence (ai_messages arrives with migration 0003).
    try {
      const admin = createAdminClient();
      const last = messages[messages.length - 1];
      await admin.from("ai_messages" as never).insert([
        { role: "user", content: last?.content ?? "", user_id: user.id },
        { role: "assistant", content: text, user_id: user.id },
      ] as never);
    } catch {
      /* ignore until table exists */
    }

    return Response.json({ reply: text });
  } catch (err) {
    return toErrorResponse(err);
  }
}
