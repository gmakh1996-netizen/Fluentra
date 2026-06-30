import "server-only";
import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { unauthorized, forbidden } from "@/lib/errors";
import { routes } from "@/config/site";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Role = Database["public"]["Enums"]["user_role"];

// ── API-route guards (throw ApiError → JSON error response) ───────────

/** Returns the authenticated user or throws 401. For API route handlers. */
export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw unauthorized();
  return user;
}

/** Returns the authenticated admin user or throws 401/403. For API route handlers. */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (profile?.role !== "admin") throw forbidden("Admin access required.");
  return user;
}

// ── Shared helpers ────────────────────────────────────────────────────

/** Invalidate the server-side profile cache for a user (e.g. after tier change). */
export function revalidateProfileCache(userId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (revalidateTag as any)(`profile:${userId}`);
}

/**
 * The current user's profile row.
 * Two-level cache:
 * 1. unstable_cache — persists across requests for 60s (avoids DB on every navigation)
 * 2. React cache    — deduplicates within a single render (layout + page share one result)
 */
export const getProfile = cache(async (userId: string): Promise<Profile | null> => {
  return unstable_cache(
    async (id: string) => {
      const admin = createAdminClient();
      const { data } = await admin
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      return (data as unknown as Profile | null) ?? null;
    },
    ["profile", userId],
    { revalidate: 60, tags: [`profile:${userId}`] },
  )(userId);
});

/**
 * Current { user, profile } pair, or null when signed out.
 * Uses getSession() (cookie/JWT — no network call) for page/layout rendering;
 * middleware already calls getUser() on every request for security.
 * Cached per request so multiple callers within a render share one result.
 */
export const getSession = cache(
  async (): Promise<{ user: User; profile: Profile | null } | null> => {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return { user: session.user, profile: await getProfile(session.user.id) };
  },
);

// ── Page/layout guards (redirect → friendly navigation) ───────────────

/**
 * For Server Components/layouts: ensures a signed-in user, redirecting to login
 * (preserving the return path) instead of throwing. Middleware already gates
 * protected prefixes; this is defense-in-depth and gives pages the profile.
 */
export async function requireUserPage(
  nextPath?: string,
): Promise<{ user: User; profile: Profile | null }> {
  const session = await getSession();
  if (!session) {
    redirect(`${routes.login}${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`);
  }
  return session;
}

/** For admin Server Components/layouts: requires the `admin` role or redirects. */
export async function requireAdminPage(): Promise<{ user: User; profile: Profile }> {
  const session = await requireUserPage(routes.admin);
  if (session.profile?.role !== "admin") {
    redirect(routes.dashboard);
  }
  return { user: session.user, profile: session.profile };
}
