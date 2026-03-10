/**
 * Captures Rezi homepage resume import/upload component screenshots for UI/UX research.
 * Run from repo root: npx playwright test capture-rezi-import-component --config=e2e-captures/playwright-rezi-capture.config.ts
 */
import { test } from "@playwright/test";
import path from "path";

const SCREENSHOTS_DIR = path.join(
  process.cwd().endsWith("frontend") ? path.resolve(process.cwd(), "..") : process.cwd(),
  "docs/research/screenshots/rezi-analysis"
);

test.describe("Rezi import/upload component capture", () => {
  test("capture full import component (gauge + drop zone)", async ({ page }) => {
    await page.goto("https://www.rezi.ai/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    const hero = page.locator(".w-embed").first();
    await hero.waitFor({ state: "visible", timeout: 10000 });
    await hero.screenshot({
      path: path.join(SCREENSHOTS_DIR, "rezi-import-upload-full-component.png"),
    });
  });

  test("capture drop zone close-up", async ({ page }) => {
    await page.goto("https://www.rezi.ai/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    const dropZone = page.locator('a:has-text("Import your resume")').first();
    await dropZone.waitFor({ state: "visible", timeout: 10000 });
    const box = await dropZone.boundingBox();
    if (box) {
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, "rezi-drop-zone-closeup.png"),
        clip: {
          x: Math.max(0, box.x - 80),
          y: Math.max(0, box.y - 40),
          width: box.width + 160,
          height: box.height + 100,
        },
      });
    }
  });

  test("capture gauge close-up", async ({ page }) => {
    await page.goto("https://www.rezi.ai/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    const importBtn = page.locator('a:has-text("Import your resume")').first();
    await importBtn.waitFor({ state: "visible", timeout: 10000 });
    const box = await importBtn.boundingBox();
    if (box) {
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, "rezi-score-gauge-closeup.png"),
        clip: {
          x: Math.max(0, box.x - 180),
          y: Math.max(0, box.y - 30),
          width: 140,
          height: 120,
        },
      });
    }
  });
});
