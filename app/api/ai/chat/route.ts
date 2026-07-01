import { streamText } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { buildTutorSystemPrompt } from "@/lib/ai/prompts";
import { chatMessageSchema, CONVERSATION_MODES, CEFR_LEVELS } from "@/lib/ai/types";
import { requireUser } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  conversationId: z.string().uuid().optional(),
  messages: z.array(chatMessageSchema).min(1),
  mode: z.enum(CONVERSATION_MODES),
  level: z.enum(CEFR_LEVELS),
  nativeLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  scenarioHint: z.string().max(300).optional(),
  debateHint: z.string().max(300).optional(),
});

let limiterPromise: ReturnType<typeof createRateLimiter> | null = null;
const limiter = () => (limiterPromise ??= createRateLimiter(30, 60)); // 30 req/min/user

async function getUserFromRequest(req: Request) {
  // Bearer token (mobile app) — verified with service-role admin client
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await createAdminClient().auth.getUser(token);
    if (user) return user;
  }
  // Cookie session fallback (web app)
  return requireUser();
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    const rl = await (await limiter())(user.id);
    if (!rl.success) throw new ApiError("rate_limited", "Slow down a moment.", 429);

    const { messages, mode, level, nativeLanguage, targetLanguage, scenarioHint, debateHint } = bodySchema.parse(
      await req.json(),
    );

    const extraHint = scenarioHint ?? debateHint;
    const system = buildTutorSystemPrompt({ nativeLanguage, targetLanguage, level, mode }) +
      (extraHint ? ` SCENE CONTEXT: ${extraHint}` : "");
    const tier = mode === "grammar" ? "premium" : "default";

    const result = streamText({
      model: getModel(tier),
      system,
      messages,
      // Persist the exchange once the stream completes.
      async onFinish({ text, usage }) {
        const admin = createAdminClient();
        const last = messages[messages.length - 1];
        // Persistence target tables land in migration 0003 (ai_conversations,
        // ai_messages). Insert is best-effort and must not break streaming.
        try {
          await admin.from("ai_messages" as never).insert([
            { role: "user", content: last?.content ?? "", user_id: user.id },
            {
              role: "assistant",
              content: text,
              user_id: user.id,
              tokens_in: usage?.promptTokens ?? null,
              tokens_out: usage?.completionTokens ?? null,
            },
          ] as never);
        } catch {
          /* table arrives in Phase 3; ignore until then */
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (err) {
    return toErrorResponse(err);
  }
}
