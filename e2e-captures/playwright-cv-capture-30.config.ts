/** Playwright config for capturing 30+ CV site screenshots (navbar + dashboard). */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: __dirname,
  testMatch: "capture-cv-pages-30.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90000,
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  },
});
