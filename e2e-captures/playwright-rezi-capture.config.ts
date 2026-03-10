/** Playwright config for capturing Rezi login screenshots. No webServer. */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: __dirname,
  testMatch: "capture-rezi-login.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  },
});
