/**
 * Captures CV/resume-specific page screenshots for UI/UX research.
 * Run: npx playwright test capture-cv-pages --config=e2e/playwright-dashboard-capture.config.ts
 */
import { test } from "@playwright/test";
import path from "path";

const SCREENSHOTS_DIR = path.join(
  process.cwd(),
  "../docs/research/screenshots/cv-pages"
);

const CV_PAGES: Array<{
  name: string;
  url: string;
  note: string;
  waitUntil?: "load" | "domcontentloaded" | "networkidle";
}> = [
  // ATS / Optimization Tools
  {
    name: "jobscan-resume-scanner",
    url: "https://www.jobscan.co/resume-scanner",
    note: "Jobscan free ATS resume checker, upload flow",
  },
  {
    name: "jobscan-resume-score",
    url: "https://www.jobscan.co/resume-score",
    note: "Jobscan AI resume score checker",
  },
  {
    name: "teal-resume-builder",
    url: "https://www.tealhq.com/tools/resume-builder",
    note: "Teal AI resume builder landing",
  },
  {
    name: "rezi-builder",
    url: "https://www.rezi.ai",
    note: "Rezi AI resume builder landing",
  },
  {
    name: "rezi-app",
    url: "https://app.rezi.ai",
    note: "Rezi app (may redirect to login)",
  },
  {
    name: "skillsyncer",
    url: "https://skillsyncer.com",
    note: "SkillSyncer ATS resume scanner landing",
  },
  {
    name: "enhancv",
    url: "https://enhancv.com",
    note: "Enhancv resume builder landing",
  },
  // CV/Resume Builders
  {
    name: "zety-resume-builder",
    url: "https://zety.com/resume-builder",
    note: "Zety AI resume builder",
  },
  {
    name: "zety-cv-maker",
    url: "https://zety.com/cv-maker",
    note: "Zety CV maker",
  },
  {
    name: "novoresume-builder",
    url: "https://novoresume.com/resume-builder",
    note: "Novoresume resume builder",
  },
  {
    name: "kickresume-resumes",
    url: "https://www.kickresume.com/en/resumes/",
    note: "Kickresume resume builder",
  },
  {
    name: "resume-io-builder",
    url: "https://resume.io/resume-builder",
    note: "Resume.io builder landing",
  },
  {
    name: "resume-io-templates",
    url: "https://resume.io/app/create-resume/templates",
    note: "Resume.io template selection (may redirect)",
  },
  {
    name: "rxresume",
    url: "https://rxresu.me",
    note: "Reactive Resume open-source builder",
  },
  // Job Platforms
  {
    name: "indeed",
    url: "https://www.indeed.com",
    note: "Indeed job platform (resume upload in flow)",
    waitUntil: "load" as const,
  },
  {
    name: "linkedin",
    url: "https://www.linkedin.com",
    note: "LinkedIn profile/resume (may require login)",
    waitUntil: "load" as const,
  },
];

test.describe("CV page screenshot capture", () => {
  for (const site of CV_PAGES) {
    test(`capture ${site.name}`, async ({ page }) => {
      await page.goto(site.url, {
        waitUntil: site.waitUntil ?? "networkidle",
        timeout: 45000,
      });
      await page.waitForTimeout(2000);
      const filepath = path.join(SCREENSHOTS_DIR, `${site.name}.png`);
      await page.screenshot({
        path: filepath,
        fullPage: true,
      });
    });
  }
});
