/** E2E: Compare providers flow — select 2+ providers, run comparison, view results. */
import { expect } from "@playwright/test";
import { test } from "@playwright/test";
import path from "node:path";

test.describe("Compare providers", () => {
  test("expand compare, select 2 providers, run comparison, view results", async ({
    page,
  }) => {
    await page.goto("/home");

    const fileInput = page.locator('input[type="file"]');
    const pdfPath = path.join(__dirname, "fixtures", "sample_cv.pdf");
    await fileInput.setInputFiles(pdfPath);

    await expect(page.getByText("sample_cv.pdf")).toBeVisible({ timeout: 5000 });

    const jdTextarea = page.getByPlaceholder(/Paste the job description/i);
    await jdTextarea.fill("Senior Backend Engineer. Need Python, FastAPI, and PostgreSQL.");

    await page.getByRole("button", { name: /Compare providers/i }).click();

    const anthropicCheckbox = page.getByRole("checkbox", { name: /anthropic/i });
    const openaiCheckbox = page.getByRole("checkbox", { name: /openai/i });

    await anthropicCheckbox.check();
    await openaiCheckbox.check();

    const runComparisonBtn = page.getByRole("button", { name: /Run comparison/i });
    await expect(runComparisonBtn).toBeEnabled();
    await runComparisonBtn.click();

    await page.waitForURL(/\/compare/, { timeout: 60000 });

    await expect(page.getByText("Provider Comparison")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("link", { name: /Back to Upload/i })).toBeVisible();
  });
});
