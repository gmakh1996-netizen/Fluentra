import { env } from "@/lib/env";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // epoch ms
}

/**
 * Sliding-window rate limiter. Uses Upstash Redis when configured (durable
 * across Vercel instances); otherwise an in-memory fallback suitable for local
 * dev and single-instance deploys. Keyed by an arbitrary identifier (user id
 * or IP).
 */
type Limiter = (identifier: string) => Promise<RateLimitResult>;

function inMemoryLimiter(limit: number, windowMs: number): Limiter {
  const hits = new Map<string, number[]>();
  return async (identifier: string) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const timestamps = (hits.get(identifier) ?? []).filter((t) => t > windowStart);
    timestamps.push(now);
    hits.set(identifier, timestamps);
    const success = timestamps.length <= limit;
    return {
      success,
      remaining: Math.max(0, limit - timestamps.length),
      reset: now + windowMs,
    };
  };
}

async function upstashLimiter(limit: number, windowSeconds: number): Promise<Limiter> {
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  });
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    prefix: "fluentra:rl",
  });
  return async (identifier: string) => {
    const { success, remaining, reset } = await rl.limit(identifier);
    return { success, remaining, reset };
  };
}

/** Create a named limiter. `limit` requests per `windowSeconds`. */
export async function createRateLimiter(limit: number, windowSeconds: number): Promise<Limiter> {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return upstashLimiter(limit, windowSeconds);
  }
  return inMemoryLimiter(limit, windowSeconds * 1000);
}
