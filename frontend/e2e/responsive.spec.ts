/** E2E: Responsive flow on mobile viewport. */
import { expect } from "@playwright/test";
import { test } from "@playwright/test";
import path from "node:path";

test.describe("Responsive", () => {
  test.use({ viewport: { width: 393, height: 851 } });

  test("optimize flow on mobile viewport", async ({ page }) => {
    await page.goto("/home");

    await page.locator('input[type="file"]').setInputFiles(path.join(__dirname, "fixtures", "sample_cv.pdf"));
    await page.getByPlaceholder(/Paste the job description/i).fill("Backend Engineer.");
    await page.getByRole("button", { name: /optimize|Optimize/i }).click();

    await page.waitForURL(/\/results/, { timeout: 60000 });
    await expect(page.getByText(/\d+/).first()).toBeVisible({ timeout: 15000 });
  });
});
