/** E2E: Happy path — upload PDF, paste JD, optimize, view results. */
import { expect } from "@playwright/test";
import { test } from "@playwright/test";
import path from "node:path";

test.describe("Optimize flow", () => {
  test("upload PDF, paste JD, optimize, view results", async ({ page }) => {
    await page.goto("/home");

    const fileInput = page.locator('input[type="file"]');
    const pdfPath = path.join(__dirname, "fixtures", "sample_cv.pdf");
    await fileInput.setInputFiles(pdfPath);

    await expect(page.getByText("sample_cv.pdf")).toBeVisible({ timeout: 5000 });

    const jdTextarea = page.getByPlaceholder(/Paste the job description/i);
    await jdTextarea.fill("Senior Backend Engineer. Need Python, FastAPI, and PostgreSQL.");

    const optimizeBtn = page.getByRole("button", { name: /optimize|Optimize/i });
    await optimizeBtn.click();

    await page.waitForURL(/\/results/, { timeout: 60000 });

    await expect(page.getByText(/\d+%?/).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/gap|Gap/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/keyword|Keyword/i).first()).toBeVisible({ timeout: 5000 });
  });
});
