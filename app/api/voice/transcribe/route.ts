import { getVoiceProvider } from "@/lib/voice/elevenlabs";
import { requireUser } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB safety cap

let limiterPromise: ReturnType<typeof createRateLimiter> | null = null;
const limiter = () => (limiterPromise ??= createRateLimiter(40, 60)); // 40/min/user

/**
 * Speech recognition. Accepts a recorded audio blob (multipart) and returns the
 * transcript via ElevenLabs Scribe. STT itself isn't metered here — the spoken
 * reply (TTS) and the AI turn (converse) carry the usage cost.
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await (await limiter())(user.id);
    if (!rl.success) throw new ApiError("rate_limited", "Slow down a moment.", 429);

    const form = await req.formData();
    const file = form.get("file");
    const language = form.get("language");

    if (!(file instanceof Blob)) {
      throw new ApiError("validation_error", "No audio provided.", 400);
    }
    if (file.size === 0 || file.size > MAX_BYTES) {
      throw new ApiError("validation_error", "Audio is empty or too large.", 400);
    }

    const audio = await file.arrayBuffer();
    const provider = getVoiceProvider();
    const transcript = await provider.transcribe(audio, file.type, {
      languageCode: typeof language === "string" && language ? language : undefined,
    });

    return Response.json(transcript);
  } catch (err) {
    return toErrorResponse(err);
  }
}
