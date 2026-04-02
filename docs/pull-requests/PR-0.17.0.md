# PR-0.17.0 — App Pages Minimalist Workspace
**Branch:** `feature/app-pages-redesign` → `main`
**Version:** `0.17.0`
**Date:** 2026-04-02
**Status:** ✅ Ready to merge

---

## Summary

Delivers a cohesive minimalist workspace for all signed-in flows: a single-card upload experience with accordion-based optional company research and in-card provider comparison, a tabbed results page with accordion gap items, refreshed history list and cards with a real empty state, tabbed history detail aligned with results, mobile horizontal snap for multi-provider comparison, semantic styling polish on the company report, and slightly longer page transitions when entering or leaving the app shell from the locale landing route. Landing-side polish on the same branch includes theme transition smoothing, a flow-field hero background, ScoreGauge hydration fixes, and dev-only auth verbosity with resilient session reads on the public landing page.

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `frontend/src/app/[locale]/(app)/home/page.tsx` | Modified | Centered card, accordion, overlay |
| `frontend/src/components/ui/CompanySearch/CompanySearch.tsx` | Modified | Flat inner layout |
| `frontend/src/app/[locale]/(app)/results/page.tsx` | Modified | Tabbed results |
| `frontend/src/components/ui/GapAnalysis/GapAnalysis.tsx` | Modified | Accordion gaps |
| `frontend/src/components/ui/HistoryList/HistoryList.tsx` | Modified | Empty state, responsive grid |
| `frontend/src/components/ui/HistoryCard/HistoryCard.tsx` | Modified | Compact layout, hover accent |
| `frontend/src/app/[locale]/(app)/history/[id]/page.tsx` | Modified | Tabs + breadcrumb |
| `frontend/src/components/ui/ProviderComparison/ProviderComparison.tsx` | Modified | Snap + grid + per-card ScrollArea |
| `frontend/src/components/ui/CompanyReport/CompanyReport.tsx` | Modified | Section borders, badge tokens |
| `frontend/src/app/[locale]/(app)/report/page.tsx` | Modified | Nav |
| `frontend/src/components/ui/PageTransition/PageTransition.tsx` | Modified | Landing↔app duration |
| `frontend/src/app/globals.css` | Modified | Theme transitions |
| `frontend/src/components/ui/Navbar/Navbar.tsx` | Modified | Navbar transitions |
| `frontend/src/components/ui/FlowFieldBackground/*` | Created | Hero background |
| `frontend/src/components/landing/LandingHero/LandingHero.tsx` | Modified | Flow field |
| `frontend/src/components/ui/ScoreGauge/ScoreGauge.tsx` | Modified | Hydration-safe SVG coords |
| `frontend/src/features/auth/auth.ts` | Modified | Debug flag |
| `frontend/src/app/[locale]/(public)/page.tsx` | Modified | Session catch |

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Accordion + `multiple` on home | Allows the optional research block to close completely; tailor mode still opens by default |
| Skip ScrollArea on synced CV columns | Keeps scroll position coupling between panes |
| Snap layout inside `ProviderComparison` | One implementation shared by the compare route |
| Path-based transition duration | Cheap signal for marketing vs app without coupling to route groups in the transition component |

## Testing Checklist

- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run build`
- [x] `vitest` — `ProviderComparison` tests
- [ ] Home: centered card, accordion default closed, tailor query opens research
- [ ] Results: three tabs, sticky export bar, gap accordion
- [ ] History: empty state CTA, card grid at xl, detail tabs
- [ ] Compare: horizontal snap on narrow viewports, grid on md+
- [ ] Report: section left border, readable in light and dark
- [ ] Landing ↔ app navigation feels slightly slower than in-app hops
- [ ] English and Spanish strings for new or touched copy
- [ ] No new hydration or console errors on above pages

## Deployment Notes

- Frontend-only release; no database or API migrations.
- No new environment variables.

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run lint && npm run build
# All succeeded (2026-04-02)

npx vitest run src/components/ui/ProviderComparison/ProviderComparison.test.tsx
# 5 tests passed
```
