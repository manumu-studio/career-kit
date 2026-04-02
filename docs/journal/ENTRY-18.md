# ENTRY-18 — App Pages Minimalist Workspace
**Date:** 2026-04-02
**Type:** Feature
**Branch:** `feature/app-pages-redesign`
**Version:** `0.17.0`

---

## What I Did

Restructured the authenticated app around a single-column, card-first layout. The upload page is now one centered card with upload and job description side by side on larger screens, optional company research in a collapsible accordion (opens automatically when the user arrives from tailor mode), and compare-providers controls in the same card. Long optimization runs show a full-screen overlay with a spinner instead of a multi-step progress bar.

The results page no longer stacks every section vertically: match score and keywords stay visible at the top, summary sits below, and CV comparison, gap analysis, and cover letter live in tabs. Gap analysis uses accordion rows instead of animated cards. The history list gained a proper empty state with a call to action, tighter cards with a smaller inline score gauge, and a three-column grid on wide screens. History detail mirrors the results layout with two tabs (no cached cover letter). Provider comparison uses a horizontal snap carousel on small screens and a grid on desktop, with scrollable optimized CV text per provider.

The company report gained consistent left-border emphasis on sections and semantic colors on confidence badges. Page transitions run slightly longer when navigating between the marketing landing route and the app so the light workspace does not appear to snap in instantly.

Pre-work on this branch also included smoother global theme transitions, a particle flow-field background on the landing hero, ScoreGauge hydration stability, and safer session handling when session cookies were encrypted with an older secret.

## Files Touched

| File | Action | Notes |
|------|--------|-------|
| `frontend/src/app/[locale]/(app)/home/page.tsx` | Modified | Centered card, accordion, overlay submit |
| `frontend/src/components/ui/CompanySearch/CompanySearch.tsx` | Modified | Removed inner card shell |
| `frontend/src/app/[locale]/(app)/results/page.tsx` | Modified | Tabs, zones |
| `frontend/src/components/ui/GapAnalysis/GapAnalysis.tsx` | Modified | Accordion |
| `frontend/src/components/ui/HistoryList/HistoryList.tsx` | Modified | Empty state, grid |
| `frontend/src/components/ui/HistoryCard/HistoryCard.tsx` | Modified | Layout, hover accent |
| `frontend/src/app/[locale]/(app)/history/[id]/page.tsx` | Modified | Tabs, breadcrumb |
| `frontend/src/components/ui/ProviderComparison/ProviderComparison.tsx` | Modified | Snap + grid + ScrollArea |
| `frontend/src/components/ui/CompanyReport/CompanyReport.tsx` | Modified | Borders, badges |
| `frontend/src/app/[locale]/(app)/report/page.tsx` | Modified | Back nav |
| `frontend/src/components/ui/PageTransition/PageTransition.tsx` | Modified | Boundary duration |
| `frontend/src/app/globals.css` | Modified | Theme transitions |
| `frontend/src/components/ui/Navbar/Navbar.tsx` | Modified | Transition tweak |
| `frontend/src/components/ui/FlowFieldBackground/*` | Created | Landing background |
| `frontend/src/components/landing/LandingHero/LandingHero.tsx` | Modified | Flow field integration |
| `frontend/src/components/ui/ScoreGauge/ScoreGauge.tsx` | Modified | Coordinate rounding |
| `frontend/src/features/auth/auth.ts` | Modified | Verbose auth logs in dev only |
| `frontend/src/app/[locale]/(public)/page.tsx` | Modified | Graceful session errors |

## Decisions

**Accordion on home** — Uses the same UI primitive family as the rest of the app; `multiple` with a single item so the panel can be fully closed.

**Keep native scroll in CV comparison** — Synchronized scrolling between original and optimized columns is more important than custom scrollbar chrome.

**Implement compare layout in `ProviderComparison`** — Avoids duplicating provider card markup on the page and keeps one source of truth for comparison UI.

**Longer transition only on landing↔app boundary** — Detected with a simple locale-root pathname rule so in-app navigation stays snappy.

## Still Open

- Manual pass at mobile, tablet, and desktop breakpoints, both themes, and both locales.
- Optional: tighten tab list layout on very narrow results/history detail if feedback says stacked triggers feel tall.

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```

All passed on 2026-04-02. `ProviderComparison` unit tests: 5 passed.
