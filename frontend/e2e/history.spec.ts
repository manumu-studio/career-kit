/** E2E: History list and detail. */
import { expect } from "@playwright/test";
import { test } from "@playwright/test";

test.describe("History flow", () => {
  test("navigate to history and verify list or empty state", async ({ page }) => {
    await page.goto("/history");

    const listOrEmpty = page.getByText(/history|no analyses|empty/i).first();
    await expect(listOrEmpty).toBeVisible({ timeout: 10000 });
  });

  test("if entries exist, click one and verify detail", async ({ page }) => {
    await page.goto("/history");

    const firstEntry = page.getByRole("link", { name: /view|detail|\d+%/i }).first();
    const exists = await firstEntry.isVisible().catch(() => false);
    if (exists) {
      await firstEntry.click();
      await page.waitForURL(/\/history\/[a-f0-9-]+/);
      await expect(page.getByText(/\d+|score|gap|keyword/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
