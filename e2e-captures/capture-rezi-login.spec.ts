/**
 * Captures Rezi login page screenshots for UI/UX research.
 * Run from repo root: npx playwright test capture-rezi-login --config=e2e-captures/playwright-rezi-capture.config.ts
 */
import { test } from "@playwright/test";
import path from "path";

const SCREENSHOTS_DIR = path.join(
  process.cwd(),
  "docs/research/screenshots/rezi-analysis"
);

test.describe("Rezi login capture", () => {
  test("capture Rezi login full page", async ({ page }) => {
    await page.goto("https://app.rezi.ai/login", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "rezi-login-full.png"),
      fullPage: true,
    });
  });

  test("capture Rezi login left panel", async ({ page }) => {
    await page.goto("https://app.rezi.ai/login", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "rezi-login-left.png"),
      clip: { x: 0, y: 0, width: 560, height: 800 },
    });
  });

  test("capture Rezi login form and buttons", async ({ page }) => {
    await page.goto("https://app.rezi.ai/login", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "rezi-login-form-buttons.png"),
      clip: { x: 0, y: 80, width: 560, height: 420 },
    });
  });

  test("capture Rezi login right panel", async ({ page }) => {
    await page.goto("https://app.rezi.ai/login", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "rezi-login-right.png"),
      clip: { x: 560, y: 0, width: 720, height: 800 },
    });
  });

  test("capture Rezi login resume preview close-up", async ({ page }) => {
    await page.goto("https://app.rezi.ai/login", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "rezi-login-resume-preview.png"),
      clip: { x: 560, y: 100, width: 480, height: 400 },
    });
  });

  test("capture Rezi login AI Keyword Targeting panel", async ({ page }) => {
    await page.goto("https://app.rezi.ai/login", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "rezi-login-keywords.png"),
      clip: { x: 560, y: 220, width: 320, height: 380 },
    });
  });
});
