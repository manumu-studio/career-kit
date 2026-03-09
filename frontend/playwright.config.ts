/** Playwright E2E configuration for Career Kit. */
import { defineConfig, devices } from "@playwright/test";

const E2E_PORT = 3010;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["list"],
  ],
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: [
    {
      command: "cd ../backend && python3 -m uvicorn app.main:app --port 8000",
      port: 8000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: `npx next dev -p ${E2E_PORT}`,
      port: E2E_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        NEXT_PUBLIC_E2E_BYPASS_AUTH: "true",
        NEXT_PUBLIC_API_URL: "http://localhost:8000",
      },
    },
  ],
});
