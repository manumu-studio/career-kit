/** E2E: Error scenarios. */
import { expect } from "@playwright/test";
import { test } from "@playwright/test";

test.describe("Error handling", () => {
  test("upload non-PDF shows error", async ({ page }) => {
    await page.goto("/home");

    await page.locator('input[type="file"]').setInputFiles({
      name: "resume.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("plain text content"),
    });

    await expect(page.getByText(/Only PDF|PDF files are supported/i)).toBeVisible({ timeout: 5000 });
  });

  test("optimize without job description shows disabled button", async ({ page }) => {
    await page.goto("/home");

    await page.locator('input[type="file"]').setInputFiles({
      name: "cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\nminimal"),
    });

    const optimizeBtn = page.getByRole("button", { name: /optimize|Optimize/i });
    await expect(optimizeBtn).toBeDisabled();
  });
});
