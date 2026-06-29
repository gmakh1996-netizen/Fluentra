import { z } from "zod";
import { getVoiceProvider } from "@/lib/voice/elevenlabs";
import { requireUser } from "@/lib/auth";
import { consumeUsage } from "@/lib/usage";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  text: z.string().min(1).max(1000),
  voiceId: z.string().min(1),
  speed: z.number().min(0.5).max(2).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { text, voiceId, speed } = bodySchema.parse(await req.json());

    // Charge ~ one second per ~15 chars as a coarse pre-estimate.
    await consumeUsage(user.id, "voice_seconds", Math.ceil(text.length / 15));

    const provider = getVoiceProvider();
    const audio = await provider.synthesize(text, { voiceId, speed });

    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=86400" },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
