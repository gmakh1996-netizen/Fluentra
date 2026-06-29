import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

const bodySchema = z.object({
  display_name: z.string().max(80).optional(),
});

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = bodySchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const admin = createAdminClient();
    const updates: Record<string, unknown> = {};
    if (body.data.display_name !== undefined) updates.display_name = body.data.display_name || null;

    if (Object.keys(updates).length) {
      await admin.from("profiles" as never).update(updates as never).eq("id", user.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
