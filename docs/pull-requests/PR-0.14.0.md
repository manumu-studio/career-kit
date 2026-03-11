# PR-0.14.0 — Tailored Optimization Flow

**Branch:** `feature/design-system` → `main`
**Date:** 2026-03-11
**Status:** ✅ Ready to merge

---

## Summary

Comprehensive design system overhaul: ShadCN/ui primitives, dark/light theme (next-themes), Framer Motion animations, Raleway typography, and 38 CSS design tokens. Landing page fully redesigned with hero, feature showcase, how-it-works, provider badges, CTA footer, and site footer. App pages (results, history, compare) polished with improved layouts. E2E capture scripts cleaned up. Auth session debugging endpoint added (dev-only gated).

---

## Scope

This PR bundles five areas of work into one cohesive release:

### 1. Design System Foundation

- ShadCN/ui installed (base-nova preset): 13 primitives (button, card, input, textarea, select, badge, dropdown-menu, tooltip, separator, sheet, dialog, toggle, skeleton)
- next-themes for dark/light mode with system preference + persistence
- Framer Motion for page transitions and micro-animations
- Raleway variable font (weights 300–700)
- 38 CSS variables (dark + light) in `globals.css`
- ThemeToggle (sun/moon with animation) + ThemeProvider

### 2. Landing Page Redesign

- New components: LandingHero, FeatureShowcase, HowItWorks, ProvidersSection, CtaFooterSection, Footer
- Supporting primitives: AnimatedText, FeatureCard, StepCard
- Provider SVG logos (Anthropic, Gemini, OpenAI)
- Animated headline with staggered word reveal

### 3. App Page Polish

- Results page: layout restructured for better visual hierarchy
- History detail page: aligned with results layout
- History list: search, filters, pagination improvements
- Compare page: updated styling
- Navbar: glass blur, mobile drawer (Sheet), auth-aware, language/theme toggles replace UserBar

### 4. Component Migration to ShadCN

- 11 existing components migrated to ShadCN primitives
- Hardcoded colors (slate-_, sky-_) → CSS variable classes
- Custom buttons → ShadCN Button variants
- Card containers → ShadCN Card
- Status pills → ShadCN Badge (+ custom success/warning variants)
- Loading shimmer → ShadCN Skeleton

### 5. Cleanup & Fixes

- Deleted 8 e2e capture scripts (moved to e2e-captures/ previously)
- Debug session route (dev-only, returns 404 in production)
- Auth callback error logging

---

## Files Changed

| Area                    | File                                         | Action                                         |
| ----------------------- | -------------------------------------------- | ---------------------------------------------- |
| **E2E cleanup**         | e2e/capture-cv-pages-30.spec.ts              | Deleted                                        |
|                         | e2e/capture-cv-pages.spec.ts                 | Deleted                                        |
|                         | e2e/capture-dashboards.spec.ts               | Deleted                                        |
|                         | e2e/capture-rezi-login.spec.ts               | Deleted                                        |
|                         | e2e/playwright-cv-capture-30.config.ts       | Deleted                                        |
|                         | e2e/playwright-cv-capture.config.ts          | Deleted                                        |
|                         | e2e/playwright-dashboard-capture.config.ts   | Deleted                                        |
|                         | e2e/playwright-rezi-capture.config.ts        | Deleted                                        |
| **i18n**                | messages/en.json                             | Modified — new keys for navbar, landing, pages |
|                         | messages/es.json                             | Modified — Spanish equivalents, full parity    |
| **Assets**              | public/assets/providers/anthropic.svg        | New                                            |
|                         | public/assets/providers/gemini.svg           | New                                            |
|                         | public/assets/providers/openai.svg           | New                                            |
| **Pages**               | src/app/[locale]/(app)/compare/page.tsx      | Modified — styling                             |
|                         | src/app/[locale]/(app)/history/[id]/page.tsx | Modified — layout restructure                  |
|                         | src/app/[locale]/(app)/history/page.tsx      | Modified — search, filters, pagination         |
|                         | src/app/[locale]/(app)/home/page.tsx         | Modified — ShadCN migration                    |
|                         | src/app/[locale]/(app)/layout.tsx            | Modified — Navbar, OptimizationProvider        |
|                         | src/app/[locale]/(app)/report/page.tsx       | Modified — styling                             |
|                         | src/app/[locale]/(app)/results/page.tsx      | Modified — layout restructure                  |
|                         | src/app/[locale]/(public)/layout.tsx         | Modified — Navbar public mode                  |
|                         | src/app/[locale]/(public)/page.tsx           | Modified — full landing redesign               |
|                         | src/app/[locale]/not-found.tsx               | Modified — design tokens                       |
|                         | src/app/not-found.tsx                        | Modified — design tokens                       |
|                         | src/app/globals.css                          | Modified — 38 CSS vars, animations, font       |
|                         | src/app/layout.tsx                           | Modified — ThemeProvider, TooltipProvider      |
| **Auth**                | src/app/api/auth/[...nextauth]/route.ts      | Modified — callback logging                    |
|                         | src/app/api/debug-session/route.ts           | New — dev-only debug endpoint                  |
|                         | src/features/auth/auth.ts                    | Modified — debug logging                       |
| **Landing components**  | src/components/landing/CtaFooterSection/     | New (2 files)                                  |
|                         | src/components/landing/FeatureShowcase/      | New (2 files)                                  |
|                         | src/components/landing/HowItWorks/           | New (2 files)                                  |
|                         | src/components/landing/LandingHero/          | New (3 files)                                  |
|                         | src/components/landing/ProvidersSection/     | New (2 files)                                  |
| **UI components**       | src/components/ui/AnimatedText/              | New (3 files)                                  |
|                         | src/components/ui/FeatureCard/               | New (3 files)                                  |
|                         | src/components/ui/Footer/                    | New (3 files)                                  |
|                         | src/components/ui/LinkWithSpinner/           | New (2 files)                                  |
|                         | src/components/ui/PageTransition/            | New (2 files)                                  |
|                         | src/components/ui/ScoreGauge/                | New (3 files)                                  |
|                         | src/components/ui/StepCard/                  | New (3 files)                                  |
|                         | src/components/ui/SubmitButtonWithSpinner/   | New (2 files)                                  |
| **Modified components** | src/components/ui/CompanyReport/             | Modified — ShadCN + tests                      |
|                         | src/components/ui/CoverLetterDisplay/        | Modified — ShadCN + tests                      |
|                         | src/components/ui/CvComparison/              | Modified — ShadCN + tests                      |
|                         | src/components/ui/ExportToolbar/             | Modified — ShadCN                              |
|                         | src/components/ui/FileUpload/                | Modified — ShadCN                              |
|                         | src/components/ui/GapAnalysis/               | Modified — grid layout + tests                 |
|                         | src/components/ui/HistoryCard/               | Modified — ShadCN + tests                      |
|                         | src/components/ui/HistoryList/               | Modified — ShadCN + tests                      |
|                         | src/components/ui/KeywordChips/              | Modified — styling                             |
|                         | src/components/ui/KeywordMatch/              | Modified — ShadCN + tests                      |
|                         | src/components/ui/LoadingSkeleton/           | Modified — ShadCN                              |
|                         | src/components/ui/Navbar/                    | Modified — full rewrite                        |
|                         | src/components/ui/ProgressBar/               | Modified — styling                             |
|                         | src/components/ui/ProviderComparison/        | Modified — ShadCN + tests                      |
|                         | src/components/ui/ProviderSelector/          | Modified — ShadCN + tests                      |
|                         | src/components/ui/ScoreCard/                 | Modified — ScoreGauge extraction               |
|                         | src/components/ui/ThemeToggle/               | Modified — animation                           |
|                         | src/components/ui/button.tsx                 | Modified — variants                            |
| **Utilities**           | src/lib/name-utils.ts                        | New — name formatting                          |
|                         | src/lib/name-utils.test.ts                   | New — tests                                    |
| **Test infra**          | src/test/setup.ts                            | Modified — mocks                               |
|                         | src/test/utils.tsx                           | Modified — test providers                      |
|                         | vitest.config.ts                             | Modified — coverage config                     |

---

## Architecture Decisions

| Decision                            | Why                                                                 |
| ----------------------------------- | ------------------------------------------------------------------- |
| ShadCN/ui (base-nova)               | Unstyled primitives + Tailwind = full control, no CSS-in-JS runtime |
| next-themes over custom             | ~2KB, handles SSR hydration, system preference, cookie persistence  |
| Framer Motion                       | Page transitions + micro-interactions, tree-shakeable               |
| CSS variables for tokens            | Works with Tailwind v4, supports runtime theme switching            |
| ScoreGauge extracted from ScoreCard | Reusable SVG gauge, separation of concerns                          |
| Navbar replaces UserBar             | Single responsive nav with glass blur, mobile drawer, auth-aware    |
| Debug route dev-gated               | Returns 404 in production, useful for auth debugging locally        |

---

## Testing Checklist

- [x] Dark/light theme toggle works, persists across refresh
- [x] Landing page renders all sections (hero, features, how-it-works, providers, CTA, footer)
- [x] Navbar: glass blur, mobile drawer, language/theme toggles, sign out
- [x] All 13 ShadCN primitives render correctly in both themes
- [x] Results page layout: score + keywords inline, CV comparison full width, gaps grid
- [x] History detail page matches results layout
- [x] Component tests pass (ScoreCard, GapAnalysis, KeywordMatch, CvComparison, HistoryCard, etc.)
- [x] i18n: all new keys in EN + ES, no missing translations
- [x] Debug route returns 404 in production mode
- [x] No `any` types, strict TypeScript

---

## Deployment Notes

- No new environment variables required
- No backend changes in this PR
- Vercel will auto-deploy on merge (existing config)
- Provider SVGs added to `public/assets/` — served statically

---

## Validation

```bash
# Frontend
cd frontend && npx tsc --noEmit && npm run build && npm run lint && npm run test
# All passing
```
