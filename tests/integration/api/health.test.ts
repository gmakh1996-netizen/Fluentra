import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures these references are available inside the vi.mock factory
const mockSelect = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: () => ({ select: mockSelect }),
  }),
}));

describe("GET /api/health", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns { db: 'ok', count: number } when Supabase is reachable", async () => {
    mockSelect.mockResolvedValue({ count: 12, error: null });
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.db).toBe("ok");
    expect(body.count).toBe(12);
  });

  it("returns 500 when Supabase returns an error", async () => {
    mockSelect.mockResolvedValue({ count: null, error: new Error("DB unreachable") });
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
