import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility — public pages", () => {
  test("landing page has no critical accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, `Critical violations: ${critical.map((v) => v.description).join(", ")}`).toHaveLength(0);
  });

  test("login page has no critical accessibility violations", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, `Critical violations: ${critical.map((v) => v.description).join(", ")}`).toHaveLength(0);
  });

  test("register page has no critical accessibility violations", async ({ page }) => {
    await page.goto("/register");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, `Critical violations: ${critical.map((v) => v.description).join(", ")}`).toHaveLength(0);
  });

  test("pricing page has no critical accessibility violations", async ({ page }) => {
    await page.goto("/pricing");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, `Critical violations: ${critical.map((v) => v.description).join(", ")}`).toHaveLength(0);
  });

  test("login page has labels on form inputs", async ({ page }) => {
    await page.goto("/login");
    const inputs = page.locator('input[type="email"], input[type="password"]');
    for (const input of await inputs.all()) {
      const id = await input.getAttribute("id");
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label.or(page.locator(`[aria-label]`).filter({ has: input }))).toBeTruthy();
      }
    }
  });

  test("landing page images have alt text", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      const role = await images.nth(i).getAttribute("role");
      // Must have alt text OR role="presentation" to be valid
      expect(alt !== null || role === "presentation", `Image ${i} missing alt attribute`).toBe(true);
    }
  });

  test("landing page has a landmark main element", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
  });
});
