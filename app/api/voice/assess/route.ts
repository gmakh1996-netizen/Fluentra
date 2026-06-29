import { getPronunciationProvider } from "@/lib/pronunciation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024;

let limiterPromise: ReturnType<typeof createRateLimiter> | null = null;
const limiter = () => (limiterPromise ??= createRateLimiter(40, 60));

/**
 * Pronunciation scoring. Sends the recorded audio + the reference phrase to the
 * active provider (Azure Pronunciation Assessment when configured, AI fallback
 * otherwise) and persists the result to `pronunciation_sessions` (own-row RLS).
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await (await limiter())(user.id);
    if (!rl.success) throw new ApiError("rate_limited", "Slow down a moment.", 429);

    const form = await req.formData();
    const file = form.get("file");
    const referenceText = form.get("referenceText");
    const language = form.get("language");

    if (typeof referenceText !== "string" || !referenceText.trim()) {
      throw new ApiError("validation_error", "Missing reference text.", 400);
    }
    if (!(file instanceof Blob) || file.size === 0 || file.size > MAX_BYTES) {
      throw new ApiError("validation_error", "Audio is empty or too large.", 400);
    }

    const audio = await file.arrayBuffer();
    const provider = await getPronunciationProvider();
    const score = await provider.assess(
      audio,
      referenceText,
      typeof language === "string" && language ? language : "en",
    );

    // Save history (best-effort; never block returning the score to the user).
    try {
      const supabase = await createClient();
      await supabase.from("pronunciation_sessions" as never).insert({
        user_id: user.id,
        phrase: referenceText,
        accuracy_score: score.accuracy,
        fluency_score: score.fluency,
        completeness_score: score.completeness,
        confidence_score: score.confidence,
        phoneme_scores: score.phonemes,
        tips: score.tips,
        graded: score.graded,
      } as never);
    } catch {
      /* history table is non-critical for the response */
    }

    return Response.json(score);
  } catch (err) {
    return toErrorResponse(err);
  }
}
