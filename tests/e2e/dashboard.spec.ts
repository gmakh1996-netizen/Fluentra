import { test, expect } from "@playwright/test";

// Tests the public-facing routes (no auth required) and verifies
// protected routes redirect to login rather than returning 404.

test.describe("Public pages", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).not.toHaveURL(/404/);
    await expect(page).not.toHaveURL(/error/);
  });

  test("landing page has a heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).not.toHaveURL(/404/);
  });

  test("health API returns ok", async ({ page }) => {
    const res = await page.goto("/api/health");
    expect(res?.status()).toBeLessThan(500);
  });
});

test.describe("Protected routes redirect to login", () => {
  const protectedRoutes = [
    "/dashboard",
    "/learn/chat",
    "/learn/voice",
    "/learn/lessons",
    "/learn/vocabulary",
    "/learn/grammar",
    "/learn/pronunciation",
    "/learn/writing",
    "/learn/listening",
    "/progress",
    "/achievements",
    "/settings",
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects to login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      // Should end up on /login (not a 404)
      await expect(page).toHaveURL(/login/);
      await expect(page).not.toHaveURL(/404/);
    });
  }
});

test.describe("Admin routes redirect to login", () => {
  const adminRoutes = [
    "/admin",
    "/admin/users",
    "/admin/subscriptions",
    "/admin/ai-usage",
    "/admin/reports",
    "/admin/support",
    "/admin/content",
  ];

  for (const route of adminRoutes) {
    test(`${route} redirects unauthenticated users`, async ({ page }) => {
      await page.goto(route);
      await expect(page).not.toHaveURL(/404/);
      await expect(page).toHaveURL(/login/);
    });
  }
});
