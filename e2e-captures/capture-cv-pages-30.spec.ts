/**
 * Captures navbar + dashboard screenshots for 30+ CV/resume sites (UI/UX research).
 * Run from repo root: npx playwright test capture-cv-pages-30 --config=e2e-captures/playwright-cv-capture-30.config.ts
 */
import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOTS_DIR = path.join(
  process.cwd(),
  "docs/research/screenshots/cv-pages-30"
);

type SiteConfig = {
  name: string;
  homeUrl: string;
  dashboardUrl?: string;
  category: string;
  note?: string;
};

const SITES: SiteConfig[] = [
  // Resume / CV Builders
  { name: "visualcv", homeUrl: "https://www.visualcv.com", category: "Resume Builder", dashboardUrl: "https://www.visualcv.com/app" },
  { name: "resumegenius", homeUrl: "https://resumegenius.com", category: "Resume Builder", dashboardUrl: "https://resumegenius.com/resume-builder" },
  { name: "resumebuilder", homeUrl: "https://www.resumebuilder.com", category: "Resume Builder", dashboardUrl: "https://www.resumebuilder.com/resume-builder" },
  { name: "resumelab", homeUrl: "https://resumelab.com", category: "Resume Builder", dashboardUrl: "https://resumelab.com/resume-builder" },
  { name: "livecareer", homeUrl: "https://www.livecareer.com", category: "Resume Builder", dashboardUrl: "https://www.livecareer.com/resume-builder" },
  { name: "myperfectresume", homeUrl: "https://www.myperfectresume.com", category: "Resume Builder", dashboardUrl: "https://www.myperfectresume.com/resume-builder" },
  { name: "resumenow", homeUrl: "https://www.resumenow.com", category: "Resume Builder" },
  { name: "resume101", homeUrl: "https://resume101.org", category: "Resume Builder" },
  { name: "resumecompanion", homeUrl: "https://resumecompanion.com", category: "Resume Builder" },
  { name: "resumestar", homeUrl: "https://resumestar.com", category: "Resume Builder" },
  { name: "resumecoach", homeUrl: "https://resumecoach.io", category: "Resume Builder" },
  { name: "standardresume", homeUrl: "https://standardresume.com", category: "Resume Builder", dashboardUrl: "https://standardresume.com/app" },
  { name: "flowcv", homeUrl: "https://flowcv.io", category: "Resume Builder", dashboardUrl: "https://flowcv.io/app" },
  // ATS / Optimization / Scoring
  { name: "cvcompiler", homeUrl: "https://cvcompiler.com", category: "ATS/Optimization" },
  { name: "resumeworded", homeUrl: "https://resumeworded.com", category: "ATS/Optimization", dashboardUrl: "https://resumeworded.com/resume-scanner" },
  { name: "vmock", homeUrl: "https://www.vmock.com", category: "ATS/Optimization" },
  { name: "skillroads", homeUrl: "https://skillroads.com", category: "ATS/Optimization" },
  { name: "zipjob", homeUrl: "https://www.zipjob.com", category: "ATS/Optimization" },
  { name: "topresume", homeUrl: "https://www.topresume.com", category: "ATS/Optimization" },
  { name: "resumego", homeUrl: "https://resumego.com", category: "Resume Builder" },
  // Job Platforms
  { name: "glassdoor", homeUrl: "https://www.glassdoor.com", category: "Job Platform" },
  { name: "ziprecruiter", homeUrl: "https://www.ziprecruiter.com", category: "Job Platform" },
  { name: "monster", homeUrl: "https://www.monster.com", category: "Job Platform" },
  { name: "careerbuilder", homeUrl: "https://www.careerbuilder.com", category: "Job Platform" },
  { name: "simplyhired", homeUrl: "https://www.simplyhired.com", category: "Job Platform" },
  { name: "flexjobs", homeUrl: "https://www.flexjobs.com", category: "Job Platform" },
  { name: "wellfound", homeUrl: "https://wellfound.com", category: "Job Platform", note: "formerly AngelList" },
  // Other CV Tools
  { name: "canva-resumes", homeUrl: "https://www.canva.com/create/resumes", category: "CV Tool" },
  { name: "creddle", homeUrl: "https://creddle.io", category: "CV Tool" },
  { name: "cakeresume", homeUrl: "https://www.cakeresume.com", category: "CV Tool", dashboardUrl: "https://www.cakeresume.com/resume-templates" },
  { name: "overleaf", homeUrl: "https://www.overleaf.com", category: "CV Tool", dashboardUrl: "https://www.overleaf.com/project", note: "LaTeX CV" },
  // Additional sites to reach 30+
  { name: "hiration", homeUrl: "https://hiration.com", category: "Resume Builder", dashboardUrl: "https://hiration.com/app/resume-builder" },
  { name: "resumeble", homeUrl: "https://resumeble.com", category: "Resume Builder" },
  { name: "jobhero", homeUrl: "https://www.jobhero.com", category: "Job Platform" },
  { name: "bestresume", homeUrl: "https://www.bestresume.com", category: "Resume Builder" },
  { name: "resume-com", homeUrl: "https://www.resume.com", category: "Resume Builder" },
  { name: "workable", homeUrl: "https://careers.workable.com", category: "Job Platform" },
  { name: "talentio", homeUrl: "https://www.talent.io", category: "Job Platform" },
  { name: "resumemaker", homeUrl: "https://www.resumemaker.in", category: "Resume Builder" },
  { name: "cvmaker", homeUrl: "https://www.cvmaker.com", category: "Resume Builder" },
];

// Ensure output directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

test.describe("CV pages 30 — navbar + dashboard capture", () => {
  for (const site of SITES) {
    test(`capture ${site.name}`, async ({ page }) => {
      try {
        // 1. Homepage → navbar
        await page.goto(site.homeUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await page.waitForTimeout(2000);

        // Navbar: clip top 200px for full-width nav
        const navbarPath = path.join(SCREENSHOTS_DIR, `${site.name}-navbar.png`);
        await page.screenshot({
          path: navbarPath,
          clip: { x: 0, y: 0, width: 1440, height: 200 },
        });
        // 2. Dashboard / main app (if different URL)
        const dashboardUrl = site.dashboardUrl ?? site.homeUrl;
        if (dashboardUrl !== site.homeUrl) {
          await page.goto(dashboardUrl, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });
          await page.waitForTimeout(2000);
        }

        const dashboardPath = path.join(SCREENSHOTS_DIR, `${site.name}-dashboard.png`);
        await page.screenshot({
          path: dashboardPath,
          fullPage: true,
        });
      } catch (err) {
        // Log but don't fail - we'll note in index
        console.warn(`[${site.name}] ${err instanceof Error ? err.message : String(err)}`);
      }
    });
  }
});
