import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const [authResult, { data: profiles }, { data: subs }] = await Promise.all([
      admin.auth.admin.listUsers({ perPage: 500 }),
      admin.from("profiles").select("id, display_name, role, subscription_tier"),
      admin.from("subscriptions").select("user_id, status"),
    ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const subMap     = new Map((subs     ?? []).map((s) => [s.user_id, s]));

    const users = (authResult.data?.users ?? []).map((u) => ({
      id:           u.id,
      email:        u.email ?? "",
      display_name: profileMap.get(u.id)?.display_name ?? null,
      role:         profileMap.get(u.id)?.role ?? "user",
      tier:         profileMap.get(u.id)?.subscription_tier ?? "free",
      joined:       u.created_at,
      last_sign_in: u.last_sign_in_at ?? null,
      sub_status:   subMap.get(u.id)?.status ?? "inactive",
    }));

    return NextResponse.json({ users });
  } catch (err) {
    return toErrorResponse(err);
  }
}

const patchSchema = z.object({
  userId: z.string().uuid(),
  role:   z.enum(["user", "admin"]),
});

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const { userId, role } = patchSchema.parse(await req.json());
    const admin = createAdminClient();
    await admin.from("profiles").update({ role }).eq("id", userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
