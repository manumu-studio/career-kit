/** Playwright config for capturing CV/resume page screenshots. No webServer. */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: __dirname,
  testMatch: "capture-cv-pages.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  },
});
