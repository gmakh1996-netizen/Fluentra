import { describe, it, expect, vi } from "vitest";

// tierFromPriceId reads PLANS which captures process.env at module load.
// The vitest.config.ts env block sets STRIPE_PRICE_* before any module loads.

describe("tierFromPriceId", () => {
  it("maps pro monthly price ID to pro tier", async () => {
    const { tierFromPriceId } = await import("@/lib/stripe");
    expect(tierFromPriceId("price_pro_monthly_test")).toBe("pro");
  });

  it("maps pro yearly price ID to pro tier", async () => {
    const { tierFromPriceId } = await import("@/lib/stripe");
    expect(tierFromPriceId("price_pro_yearly_test")).toBe("pro");
  });

  it("maps ultimate monthly price ID to ultimate tier", async () => {
    const { tierFromPriceId } = await import("@/lib/stripe");
    expect(tierFromPriceId("price_ultimate_monthly_test")).toBe("ultimate");
  });

  it("maps ultimate yearly price ID to ultimate tier", async () => {
    const { tierFromPriceId } = await import("@/lib/stripe");
    expect(tierFromPriceId("price_ultimate_yearly_test")).toBe("ultimate");
  });

  it("returns null for an unknown price ID", async () => {
    const { tierFromPriceId } = await import("@/lib/stripe");
    expect(tierFromPriceId("price_unknown_xyz")).toBeNull();
  });

  it("returns null for empty string", async () => {
    const { tierFromPriceId } = await import("@/lib/stripe");
    expect(tierFromPriceId("")).toBeNull();
  });
});

describe("userIdFromCustomer", () => {
  it("returns userId from customer metadata", async () => {
    const { userIdFromCustomer } = await import("@/lib/stripe");
    const mockStripe = {
      customers: {
        retrieve: vi.fn().mockResolvedValue({
          id: "cus_123",
          deleted: false,
          metadata: { userId: "user-abc" },
        }),
      },
    };
    const result = await userIdFromCustomer(mockStripe as never, "cus_123");
    expect(result).toBe("user-abc");
  });

  it("returns null for deleted customers", async () => {
    const { userIdFromCustomer } = await import("@/lib/stripe");
    const mockStripe = {
      customers: {
        retrieve: vi.fn().mockResolvedValue({ id: "cus_123", deleted: true }),
      },
    };
    expect(await userIdFromCustomer(mockStripe as never, "cus_123")).toBeNull();
  });

  it("returns null when metadata has no userId", async () => {
    const { userIdFromCustomer } = await import("@/lib/stripe");
    const mockStripe = {
      customers: {
        retrieve: vi.fn().mockResolvedValue({
          id: "cus_123",
          deleted: false,
          metadata: {},
        }),
      },
    };
    expect(await userIdFromCustomer(mockStripe as never, "cus_123")).toBeNull();
  });

  it("returns null when Stripe throws", async () => {
    const { userIdFromCustomer } = await import("@/lib/stripe");
    const mockStripe = {
      customers: { retrieve: vi.fn().mockRejectedValue(new Error("Network error")) },
    };
    expect(await userIdFromCustomer(mockStripe as never, "cus_bad")).toBeNull();
  });
});
