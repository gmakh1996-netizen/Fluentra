import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/url";
import { routes } from "@/config/site";

/**
 * OAuth + PKCE redirect target. Google/Apple sign-in, the email-confirmation
 * link, magic links and password-recovery links all return here with a `code`
 * we exchange for a session. `next` controls where the user lands afterward.
 *
 * Register this URL in the Supabase dashboard (Authentication → URL config):
 *   <site>/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"), routes.dashboard);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // `x-forwarded-host` is trusted behind Vercel's proxy; prefer it in prod.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";
      if (isLocal) return NextResponse.redirect(`${origin}${next}`);
      if (forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${next}`);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}${routes.authCodeError}`);
}
