import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/url";
import { routes } from "@/config/site";

/**
 * Alternative email verification target for projects whose email templates use
 * `{{ .TokenHash }}` instead of the default `{{ .ConfirmationURL }}` (code)
 * flow. Handles signup confirmation, magic links, email change and recovery.
 *
 * Template link format:
 *   <site>/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next=/dashboard
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"), routes.dashboard);

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}${routes.authCodeError}`);
}
