import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

/** The current user's profile row (role, tier, onboarded…), or null. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  // Cast through unknown: the generated DB types replace the stub after db:types.
  return (data as unknown as Profile | null) ?? null;
}

/** Current { user, profile } pair, or null when signed out. */
export async function getSession(): Promise<{ user: User; profile: Profile | null } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { user, profile: await getProfile(user.id) };
}

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
