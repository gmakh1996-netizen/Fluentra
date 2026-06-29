import { NextResponse } from "next/server";
import { requireUser, getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user    = await requireUser();
    const profile = await getProfile(user.id);
    const admin   = createAdminClient();

    const { data: userLangs } = await admin
      .from("user_languages" as never)
      .select("native_language_id, target_language_id, level, is_active" as never)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle() as { data: { native_language_id: string; target_language_id: string; level: string; is_active: boolean } | null };

    let nativeLang: string | null = null;
    let targetLang: string | null = null;
    let level: string | null = null;

    if (userLangs) {
      const ids = [userLangs.native_language_id, userLangs.target_language_id].filter(Boolean);
      if (ids.length) {
        const { data: langs } = await admin
          .from("languages" as never)
          .select("id, name" as never)
          .in("id", ids) as { data: { id: string; name: string }[] | null };
        const map = Object.fromEntries((langs ?? []).map((l) => [l.id, l.name]));
        nativeLang = map[userLangs.native_language_id] ?? null;
        targetLang = map[userLangs.target_language_id] ?? null;
      }
      level = userLangs.level ?? null;
    }

    return NextResponse.json({
      email:        user.email ?? "",
      displayName:  profile?.display_name ?? null,
      tier:         profile?.subscription_tier ?? "free",
      nativeLang,
      targetLang,
      level,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
