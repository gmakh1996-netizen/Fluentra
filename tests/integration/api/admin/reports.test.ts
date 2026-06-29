import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin-1", email: "admin@test.com" }),
}));

const mockAdmin = {
  auth: { admin: { listUsers: vi.fn() } },
  from: vi.fn(),
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mockAdmin,
}));

describe("GET /api/admin/reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for unknown report type", async () => {
    const { GET } = await import("@/app/api/admin/reports/route");
    const req = new Request("http://localhost/api/admin/reports?type=unknown");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns CSV for type=users", async () => {
    mockAdmin.auth.admin.listUsers.mockResolvedValue({
      data: {
        users: [{ id: "u1", email: "user@test.com", created_at: "2024-01-01", last_sign_in_at: "2024-12-01" }],
      },
    });
    mockAdmin.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: "u1", display_name: "Test User", role: "user", subscription_tier: "free", onboarded: true, created_at: "2024-01-01" }],
      }),
    });

    const { GET } = await import("@/app/api/admin/reports/route");
    const req = new Request("http://localhost/api/admin/reports?type=users");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("users.csv");

    const text = await res.text();
    expect(text).toContain("id,email");
    expect(text).toContain("user@test.com");
  });

  it("returns CSV for type=subscriptions", async () => {
    mockAdmin.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ user_id: "u1", tier: "pro", status: "active", stripe_customer_id: "cus_123",
                 stripe_subscription_id: "sub_123", stripe_price_id: "price_123",
                 trial_end: null, current_period_end: null, cancel_at_period_end: false,
                 coupon_id: null, created_at: "2024-01-01" }],
      }),
    });

    const { GET } = await import("@/app/api/admin/reports/route");
    const req = new Request("http://localhost/api/admin/reports?type=subscriptions");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("user_id,tier,status");
  });

  it("returns CSV for type=usage", async () => {
    mockAdmin.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [{ user_id: "u1", period_date: "2024-12-01", ai_messages_used: 5,
                     ai_messages_limit: 10, voice_seconds_used: 0, voice_seconds_limit: 0 }],
          }),
        }),
      }),
    });

    const { GET } = await import("@/app/api/admin/reports/route");
    const req = new Request("http://localhost/api/admin/reports?type=usage");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("user_id,period_date");
  });

  it("returns 403 when not admin", async () => {
    const { ApiError } = await import("@/lib/errors");
    vi.mocked((await import("@/lib/auth")).requireAdmin).mockRejectedValueOnce(
      new ApiError("forbidden", "Admin only", 403),
    );

    const { GET } = await import("@/app/api/admin/reports/route");
    const req = new Request("http://localhost/api/admin/reports?type=users");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });
});
