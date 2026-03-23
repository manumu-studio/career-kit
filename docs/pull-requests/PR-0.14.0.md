# PR-0.14.0 — Tailored Optimization Flow + A11y Fixes

**Branch:** `feature/tailored-optimization` → `main`
**Date:** 2026-03-23
**Status:** ✅ Ready to merge

---

## Summary

Split the landing page into two clear entry points (Quick Optimize vs Tailor for Company), enhanced the backend LLM prompt with richer company profile fields, restructured results/history layouts into a 4-section grid, and fixed six accessibility/theme bugs from a senior dev audit.

---

## Scope

### 1. Tailored Optimization Flow

- **Landing:** Dual CTAs — primary "Optimize My CV" (gradient) and secondary "Tailor for a Company" (outline + sparkle icon). FeatureShowcase cards updated.
- **Home:** `?mode=tailor` expands company research section with highlighted border and callout banner. Submit button shows "Tailor & Optimize CV" when research is loaded.
- **Results:** Company-tailored badge when optimization used company context.
- **Backend:** Enhanced LLM prompt dynamically includes `mission_statement`, `tech_stack`, `industry` from CompanyProfile when available (no more static template).

### 2. Results & History Layout Restructure

- 4-section layout: score + keywords (inline), CV comparison (full width), gap analysis (responsive grid)
- GapAnalysis: responsive 1/2/3-column grid, ScoreCard width constraints removed
- History detail page aligned with results layout

### 3. A11y & Theme Bug Fixes (Senior Dev Audit)

- Removed `←` unicode arrows from translation keys (3 `backToUpload` + 1 `backToHistory`) — replaced with Lucide icons
- Replaced hardcoded dark-only colors (`text-white`, `text-slate-*`, `bg-slate-*`, `text-sky-*`) with semantic tokens across 8 page files
- Fixed `<Link><Button>` invalid nesting → `<Link className={buttonVariants()}>` pattern
- Removed duplicate `<main>` landmarks from 6 page files (app layout already wraps in `<main>`)
- Added `headingLevel` prop to CompanyReport to avoid duplicate `<h1>` on history detail
- Fixed CompanyReport risk flags color: `text-amber-300` → `text-destructive`

### 4. Cleanup

- Deleted 9 e2e capture scripts (previously moved to `e2e-captures/`)
- Added commit-msg hook enforcing conventional commit format + Golden Goose Rule
- Debug session route (dev-only, returns 404 in production)

---

## Files Changed

| Area | File | Action | Notes |
|------|------|--------|-------|
| **Landing** | `src/app/[locale]/(public)/page.tsx` | Modified | Dual CTAs, feature card updates |
| **Home** | `src/app/[locale]/(app)/home/page.tsx` | Modified | `?mode=tailor` logic, `<main>` → `<div>` |
| **Results** | `src/app/[locale]/(app)/results/page.tsx` | Modified | 4-section layout, company badge, `<main>` → `<div>` |
| **History** | `src/app/[locale]/(app)/history/page.tsx` | Modified | `<main>` → `<div>` |
| **History detail** | `src/app/[locale]/(app)/history/[id]/page.tsx` | Modified | Breadcrumb nav, semantic colors, heading flow, link/button fix |
| **History compare** | `src/app/[locale]/(app)/history/compare/page.tsx` | Modified | Semantic colors, `<main>` → `<div>` |
| **Compare** | `src/app/[locale]/(app)/compare/page.tsx` | Modified | Semantic colors, `<main>` → `<div>`, link/button fix |
| **Report** | `src/app/[locale]/(app)/report/page.tsx` | Modified | Semantic colors, `<main>` → `<div>`, link/button fix |
| **Auth error** | `src/app/[locale]/auth/error/page.tsx` | Modified | Full semantic token migration, `<main>` → `<div>` |
| **CompanyReport** | `src/components/ui/CompanyReport/CompanyReport.tsx` | Modified | Semantic tokens, configurable heading tag |
| **CompanyReport types** | `src/components/ui/CompanyReport/CompanyReport.types.ts` | Modified | Added `headingLevel` prop |
| **GapAnalysis** | `src/components/ui/GapAnalysis/GapAnalysis.tsx` | Modified | Responsive grid layout |
| **ScoreCard** | `src/components/ui/ScoreCard/ScoreCard.tsx` | Modified | Width constraints removed |
| **i18n** | `messages/en.json` | Modified | New tailored keys, removed `←` from labels |
| **i18n** | `messages/es.json` | Modified | Spanish equivalents, removed `←` |
| **Backend** | `backend/app/core/prompts.py` | Modified | Dynamic company context builder |
| **Hooks** | `.husky/commit-msg` | Added | Conventional commits + opsec enforcement |
| **E2E** | `e2e-captures/*.spec.ts`, `*.config.ts` | Deleted | 9 files removed |
| **Debug** | `src/app/api/debug-session/route.ts` | Modified | Dev-only session debug |

---

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Dynamic company prompt builder | Only includes fields with data — avoids sending empty placeholders to LLM |
| `headingLevel` prop on CompanyReport | Reuse component at different heading depths without duplicate `<h1>` |
| `buttonVariants()` over `<Link><Button>` | Valid HTML — `<a>` cannot nest `<button>` per spec |
| Semantic CSS tokens over hardcoded colors | Supports both light and dark themes via CSS variables |
| Single `<main>` in app layout only | Pages use `<div>` — conforms to HTML landmark rules |
| commit-msg hook | Enforces conventional commit format and blocks internal workflow references |

---

## Testing Checklist

- [x] Landing: both CTAs navigate correctly (`/home` vs `/home?mode=tailor`)
- [x] Home: `?mode=tailor` expands company research with banner
- [x] Results: company-tailored badge appears when research context used
- [x] Results/history: 4-section layout renders correctly
- [x] GapAnalysis: responsive grid (1/2/3 cols) at all breakpoints
- [x] Light mode: all text readable, no invisible elements across all pages
- [x] Dark mode: visual parity with previous design
- [x] No duplicate `<main>` landmarks on any page
- [x] No `<a>` wrapping `<button>` anywhere
- [x] Translation keys: no `←` arrows, EN/ES parity
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` passes
- [x] `npm run lint` passes

---

## Deployment Notes

- No new environment variables required
- Backend: prompt change is backward-compatible (company context is optional)
- Vercel auto-deploys on merge
- EC2 backend needs `git pull` + service restart for prompt changes
