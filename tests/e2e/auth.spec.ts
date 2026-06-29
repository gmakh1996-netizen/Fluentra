import { test, expect } from "@playwright/test";

test.describe("Auth pages", () => {
  test("login page loads without errors", async ({ page }) => {
    await page.goto("/login");
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("login page has email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("login page has a submit button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("register page loads without errors", async ({ page }) => {
    await page.goto("/register");
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("register page has email and password fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("forgot-password page loads", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page).not.toHaveURL(/404/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("invalid login shows error message", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "nonexistent@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    // Should show an error (not redirect to dashboard)
    await expect(page).not.toHaveURL(/dashboard/);
  });
});
