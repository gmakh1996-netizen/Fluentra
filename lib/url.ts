import { headers } from "next/headers";
import { env } from "@/lib/env";

/**
 * Absolute origin of the current request (e.g. https://fluentra.app), used to
 * build OAuth/email redirect URLs that must be absolute and exactly match the
 * allow-list in the Supabase dashboard. Falls back to the configured app URL.
 */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host");
  if (host) {
    const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
    return `${proto}://${host}`;
  }
  return env.NEXT_PUBLIC_APP_URL;
}

/**
 * Guard against open-redirects. Only allow same-origin relative paths
 * (must start with a single "/"). Anything else falls back to `fallback`.
 */
export function safeNext(next: unknown, fallback = "/dashboard"): string {
  if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return fallback;
}
