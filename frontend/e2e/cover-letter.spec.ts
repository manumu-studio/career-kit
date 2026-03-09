/** E2E: Generate cover letter from optimization results. */
import { expect } from "@playwright/test";
import { test } from "@playwright/test";
import path from "node:path";

test.describe("Cover letter flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/home");
    await page.locator('input[type="file"]').setInputFiles(path.join(__dirname, "fixtures", "sample_cv.pdf"));
    await page.getByPlaceholder(/Paste the job description/i).fill("Backend Engineer with Python.");
    await page.getByRole("button", { name: /optimize|Optimize/i }).click();
    await page.waitForURL(/\/results/, { timeout: 60000 });
  });

  test("fill company info, select tone, generate cover letter", async ({ page }) => {
    const companyInput = page.getByPlaceholder(/company/i).or(page.getByLabel(/company/i)).first();
    await companyInput.fill("Acme Corp");

    const toneOption = page.getByRole("button", { name: /professional|conversational|enthusiastic/i }).first();
    await toneOption.click();

    const generateBtn = page.getByRole("button", { name: /generate|Generate cover letter/i });
    await generateBtn.click();

    await expect(page.getByText(/Dear|paragraph|Sincerely/i).first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/selling point|key point/i).first()).toBeVisible({ timeout: 5000 });
  });
});
