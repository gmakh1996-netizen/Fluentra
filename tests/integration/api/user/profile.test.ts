import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireUser: vi.fn().mockResolvedValue({ id: "user-1", email: "user@test.com" }),
  getProfile: vi.fn().mockResolvedValue(null),
}));

const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: vi.fn().mockReturnValue({ update: mockUpdate }) }),
}));

describe("PATCH /api/user/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates display_name and returns { ok: true }", async () => {
    const { PATCH } = await import("@/app/api/user/profile/route");
    const req = new Request("http://localhost/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: "New Name" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("accepts empty display_name to clear it", async () => {
    const { PATCH } = await import("@/app/api/user/profile/route");
    const req = new Request("http://localhost/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: "" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("returns 400 for invalid payload (name too long)", async () => {
    const { PATCH } = await import("@/app/api/user/profile/route");
    const req = new Request("http://localhost/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: "x".repeat(81) }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/errors");
    vi.mocked((await import("@/lib/auth")).requireUser).mockRejectedValueOnce(
      new ApiError("unauthorized", "Sign in first", 401),
    );

    const { PATCH } = await import("@/app/api/user/profile/route");
    const req = new Request("http://localhost/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: "test" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });
});
