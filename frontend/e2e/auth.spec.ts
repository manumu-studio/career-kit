/** E2E: Auth flows — landing page sign-in CTA, protected route access with bypass. */
import { expect } from "@playwright/test";
import { test } from "@playwright/test";

test.describe("Auth", () => {
  test("landing page shows sign-in CTA when unauthenticated", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: /Sign in with ManuMuStudio/i })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText(/AI-powered CV optimization/i)).toBeVisible();
  });

  test("with E2E bypass, /home shows user bar and app content", async ({ page }) => {
    await page.goto("/home");

    await expect(page.getByText(/E2E Test User|Career Kit/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder(/Paste the job description/i)).toBeVisible();
  });
});
