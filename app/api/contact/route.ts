import { z } from "zod";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createRateLimiter } from "@/lib/rate-limit";
import { toErrorResponse, ApiError } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(10).max(4000),
});

let limiterPromise: ReturnType<typeof createRateLimiter> | null = null;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
    limiterPromise ??= createRateLimiter(5, 3600); // 5/hour/IP
    const rl = await (await limiterPromise)(ip);
    if (!rl.success) throw new ApiError("rate_limited", "Too many messages. Try later.", 429);

    const { name, email, message } = bodySchema.parse(await req.json());

    if (!env.RESEND_API_KEY) {
      // Honest: no silent success. Phase 1 wires Resend or DB persistence.
      throw new ApiError("provider_not_configured", "Contact delivery isn't configured yet.", 501);
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Fluentra <noreply@fluentra.app>",
        to: ["support@fluentra.app"],
        reply_to: email,
        subject: `Contact form — ${name}`,
        text: message,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
