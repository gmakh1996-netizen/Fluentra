import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  nativeLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = bodySchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ ok: false });

    const admin = createAdminClient();

    // Mark onboarded — silently ignore if profiles table doesn't exist yet
    try {
      await admin
        .from("profiles" as never)
        .update({ onboarded: true } as never)
        .eq("id", user.id);
    } catch {
      // table not yet migrated
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
