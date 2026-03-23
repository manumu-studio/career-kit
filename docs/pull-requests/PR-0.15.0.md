# PR-0.15.0 — Design System Foundation
**Branch:** `feature/design-system-foundation` → `main`
**Version:** `0.15.0`
**Date:** 2026-03-23
**Status:** ✅ READY TO MERGE

---

## Summary

Established the design system foundation for the upcoming UI/UX overhaul. This release introduces updated theme tokens, new UI primitives, semantic color migration, and all necessary i18n keys for the complete redesign.

**Key Features:**
- Updated light/dark theme tokens with brand color `#2E75B6`
- `.landing-theme` CSS token set defined for future cinematic dark usage
- 4 new shadcn/ui primitives (Tabs, Progress, Accordion, ScrollArea)
- Transparent navbar with scroll-triggered glass effect
- Navbar logo adapts to transparent variant context
- ScoreGauge animation capability
- Semantic color tokens across 11 components
- Complete i18n coverage for UI overhaul

---

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `frontend/tailwind.css` | Modified | Updated light/dark tokens, added `.landing-theme` token set, registered landing tokens |
| `frontend/src/app/globals.css` | Modified | Tokenized gradient, added 4 keyframes for hero animations |
| `frontend/src/app/[locale]/(public)/layout.tsx` | Modified | Transparent navbar on public layout |
| `frontend/src/components/ui/Navbar/Navbar.types.ts` | Modified | Added `NavbarVariant` type (`"default" \| "transparent"`) |
| `frontend/src/components/ui/Navbar/Navbar.tsx` | Modified | Transparent variant with scroll tracking, logo adapts to variant |
| `frontend/src/components/ui/tabs.tsx` | Created | Shadcn Tabs primitive |
| `frontend/src/components/ui/progress.tsx` | Created | Shadcn Progress primitive |
| `frontend/src/components/ui/accordion.tsx` | Created | Shadcn Accordion primitive |
| `frontend/src/components/ui/scroll-area.tsx` | Created | Shadcn ScrollArea primitive |
| `frontend/src/components/ui/ScoreGauge/ScoreGauge.tsx` | Modified | Semantic tokens, animation with `requestAnimationFrame` |
| `frontend/src/components/ui/ScoreGauge/ScoreGauge.types.ts` | Modified | Added `animateFrom?: number` prop |
| `frontend/src/components/ui/CompanyCard/CompanyCard.tsx` | Modified | Semantic color migration |
| `frontend/src/components/ui/CompanyInfo/CompanyInfo.tsx` | Modified | Semantic color migration |
| `frontend/src/components/ui/ComparisonView/ComparisonView.tsx` | Modified | Semantic color migration |
| `frontend/src/components/ui/ToneSelector/ToneSelector.tsx` | Modified | Semantic color migration |
| `frontend/src/components/ui/FormField/FormField.tsx` | Modified | Semantic color migration |
| `frontend/src/components/ui/Toast/Toast.tsx` | Modified | Semantic color migration |
| `frontend/src/components/ui/ErrorBoundary/ErrorBoundary.tsx` | Modified | Semantic color migration |
| `frontend/src/components/ui/UserBar/UserBar.tsx` | Modified | Semantic color migration |
| `frontend/src/components/ui/ResearchProgress/ResearchProgress.tsx` | Modified | Semantic color migration |
| `frontend/src/components/ui/ProviderBadge/ProviderBadge.tsx` | Modified | Semantic color migration |
| `frontend/src/components/ui/ProviderComparison/ProviderComparison.tsx` | Modified | Semantic color migration |
| `frontend/messages/en.json` | Modified | Added 14 new i18n keys |
| `frontend/messages/es.json` | Modified | Added 14 new i18n keys with Spanish translations |

---

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Landing respects user theme preference | Consistent UX — toggle works on all pages |
| `.landing-theme` token set defined but not applied | Available for future cinematic dark sections if needed |
| Primary color: `#0070f3` → `#2E75B6` | Brand consistency with CV format navy color |
| Transparent navbar with scroll trigger | Modern landing aesthetic; glass effect appears at 50px scroll |
| Logo adapts to navbar variant | White logo on transparent (dark context), theme-aware otherwise |
| ScoreGauge animation via `requestAnimationFrame` | Smooth 60fps animation with ease-out cubic easing |
| ProgressBar kept (not deprecated) | Full-page overlay with step indicators ≠ shadcn Progress bar |
| Semantic color migration | Theme-agnostic components work in both light and dark modes |
| CSS keyframes for hero animations | Performant animations with proper `prefers-reduced-motion` support |

---

## Testing Checklist

- [x] TypeScript compiles with no errors
- [x] Build completes successfully
- [x] ESLint passes with no warnings
- [x] All 23 static pages generate correctly
- [x] Landing page respects theme toggle (light/dark)
- [x] Navbar transparent variant works on scroll
- [x] Navbar logo visible in both themes on landing
- [x] ScoreGauge animates smoothly with `animateFrom` prop
- [x] All 4 new primitives import correctly
- [x] i18n keys present in both EN and ES
- [x] No console errors in development mode

---

## Deployment Notes

**No breaking changes.** This release is purely additive:
- New CSS classes and tokens
- New component props (all optional)
- New i18n keys (not yet used in UI)
- Semantic color updates (visual parity maintained)

**Environment variables:** No changes required.

**Database migrations:** None.

**Post-deployment verification:**
1. Landing page respects user theme preference
2. App pages respect user theme preference
3. Navbar transparent at top of landing page, glass on scroll
4. All existing functionality works unchanged

---

## Validation

```bash
# TypeScript type check
cd frontend && npx tsc --noEmit
✓ No type errors

# Build
npm run build
✓ Compiled successfully
✓ Generating static pages (23/23)

# Lint
npm run lint
✓ No ESLint warnings or errors
```

All quality gates passed successfully.
