/**
 * Captures dashboard screenshots from reference sites for UI/UX research.
 * Run from repo root: npx playwright test capture-dashboards --config=e2e-captures/playwright-dashboard-capture.config.ts
 */
import { test } from "@playwright/test";
import path from "path";

const SCREENSHOTS_DIR = path.join(
  process.cwd(),
  "docs/research/screenshots"
);

const DASHBOARDS: Array<{
  name: string;
  url: string;
  note: string;
  waitUntil?: "load" | "domcontentloaded" | "networkidle";
}> = [
  { name: "linear", url: "https://linear.app/demo", note: "Linear demo workspace" },
  { name: "vercel", url: "https://vercel.com/dashboard", note: "Vercel dashboard (may redirect to login)" },
  { name: "stripe", url: "https://dashboard.stripe.com", note: "Stripe dashboard (may redirect to login)" },
  { name: "notion", url: "https://www.notion.so", note: "Notion landing (dashboard requires login)" },
  { name: "figma", url: "https://www.figma.com", note: "Figma landing (dashboard requires login)", waitUntil: "load" as const },
  { name: "plausible", url: "https://plausible.io", note: "Plausible analytics landing" },
  { name: "cal", url: "https://app.cal.com", note: "Cal.com scheduling app" },
  { name: "todoist", url: "https://todoist.com", note: "Todoist task dashboard" },
  { name: "teal", url: "https://www.tealhq.com", note: "Teal career toolkit landing" },
  { name: "jobscan", url: "https://www.jobscan.co", note: "Jobscan ATS checker landing" },
  { name: "rezi", url: "https://www.rezi.ai", note: "Rezi AI resume builder landing" },
  { name: "canva", url: "https://www.canva.com", note: "Canva design dashboard" },
  { name: "framer", url: "https://www.framer.com", note: "Framer site builder" },
  { name: "miro", url: "https://miro.com", note: "Miro board dashboard" },
  { name: "loom", url: "https://www.loom.com", note: "Loom video library" },
];

test.describe("Dashboard screenshot capture", () => {
  for (const site of DASHBOARDS) {
    test(`capture ${site.name}`, async ({ page }) => {
      await page.goto(site.url, {
        waitUntil: site.waitUntil ?? "networkidle",
        timeout: 45000,
      });
      await page.waitForTimeout(2000);
      const filepath = path.join(SCREENSHOTS_DIR, `${site.name}-dashboard.png`);
      await page.screenshot({
        path: filepath,
        fullPage: true,
      });
    });
  }
});
