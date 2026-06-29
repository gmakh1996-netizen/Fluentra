import { describe, it, expect } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

// No UPSTASH vars set → falls back to in-memory limiter

describe("createRateLimiter (in-memory fallback)", () => {
  it("allows requests within the limit", async () => {
    const limiter = await createRateLimiter(3, 60);
    const result = await limiter("user-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("tracks remaining count correctly", async () => {
    const limiter = await createRateLimiter(5, 60);
    const id = "user-tracking";
    const r1 = await limiter(id);
    const r2 = await limiter(id);
    const r3 = await limiter(id);
    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
  });

  it("rejects when limit is exceeded", async () => {
    const limiter = await createRateLimiter(2, 60);
    const id = "user-exceed";
    await limiter(id);
    await limiter(id);
    const result = await limiter(id);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("isolates different identifiers", async () => {
    const limiter = await createRateLimiter(1, 60);
    const r1 = await limiter("user-a");
    const r2 = await limiter("user-b");
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("blocks only when over limit for same identifier", async () => {
    const limiter = await createRateLimiter(2, 60);
    const id = "user-block";
    const r1 = await limiter(id);
    const r2 = await limiter(id);
    const r3 = await limiter(id);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(false);
  });

  it("returns a reset timestamp", async () => {
    const limiter = await createRateLimiter(10, 60);
    const result = await limiter("user-reset");
    expect(result.reset).toBeGreaterThan(Date.now());
  });
});
