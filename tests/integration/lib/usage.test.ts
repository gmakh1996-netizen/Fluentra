import { describe, it, expect, vi } from "vitest";

// vi.hoisted: these run before vi.mock factories, so they're available inside them
const mockSingle    = vi.hoisted(() => vi.fn());
const mockUpsert    = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }));
const mockUpdateEq  = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      upsert: mockUpsert,
      select: () => ({ eq: () => ({ eq: () => ({ single: mockSingle }) }) }),
      update: () => ({ eq: () => ({ eq: mockUpdateEq }) }),
    }),
  }),
}));

describe("consumeUsage", () => {
  it("throws usage_limit_reached when at daily limit", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { ai_messages_used: 10, ai_messages_limit: 10 },
      error: null,
    });
    const { consumeUsage } = await import("@/lib/usage");
    await expect(consumeUsage("user-1", "ai_messages")).rejects.toMatchObject({
      code: "usage_limit_reached",
      status: 429,
    });
  });

  it("resolves when under the daily limit", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { ai_messages_used: 5, ai_messages_limit: 10 },
      error: null,
    });
    mockUpdateEq.mockResolvedValueOnce({ error: null });
    const { consumeUsage } = await import("@/lib/usage");
    await expect(consumeUsage("user-2", "ai_messages")).resolves.toBeUndefined();
  });

  it("throws when Supabase select fails", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: "DB error" } });
    const { consumeUsage } = await import("@/lib/usage");
    await expect(consumeUsage("user-3", "ai_messages")).rejects.toThrow("usage lookup failed");
  });

  it("respects the amount parameter when it would exceed the limit", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { ai_messages_used: 8, ai_messages_limit: 10 },
      error: null,
    });
    const { consumeUsage } = await import("@/lib/usage");
    // 8 + 3 = 11 > 10
    await expect(consumeUsage("user-4", "ai_messages", 3)).rejects.toMatchObject({
      code: "usage_limit_reached",
    });
  });

  it("allows usage when amount exactly fits remaining budget", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { ai_messages_used: 8, ai_messages_limit: 10 },
      error: null,
    });
    mockUpdateEq.mockResolvedValueOnce({ error: null });
    const { consumeUsage } = await import("@/lib/usage");
    // 8 + 2 = 10 = limit (not over)
    await expect(consumeUsage("user-5", "ai_messages", 2)).resolves.toBeUndefined();
  });
});

describe("getRemaining", () => {
  it("returns remaining usage count", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { ai_messages_used: 3, ai_messages_limit: 10 },
    });
    const { getRemaining } = await import("@/lib/usage");
    expect(await getRemaining("user-6", "ai_messages")).toBe(7);
  });

  it("returns 0 when no row exists for today", async () => {
    mockSingle.mockResolvedValueOnce({ data: null });
    const { getRemaining } = await import("@/lib/usage");
    expect(await getRemaining("user-7", "ai_messages")).toBe(0);
  });
});
