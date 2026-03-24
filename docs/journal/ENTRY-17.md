# ENTRY-17 — Landing Page Cinematic Overhaul
**Date:** 2026-03-23 (updated 2026-03-24)
**Type:** Feature
**Branch:** `feature/design-system-foundation`
**Version:** `0.16.0`

---

## What I Did

Transformed the landing page from a text-focused layout into a portfolio-grade cinematic experience. Built an animated CV demo component that showcases the product's core value through a real-time AI optimization sequence. The hero now features a split layout with an 8-second auto-playing animation that demonstrates keyword highlighting, score calculation, and bullet rewriting.

Upgraded all below-the-fold sections with glassmorphism cards, scroll-triggered SVG line animations, and staggered reveal effects. Added gradient brand backgrounds and hover interactions throughout.

## Files Touched

| File | Action | Notes |
|------|--------|-------|
| `frontend/src/components/landing/CvDemoPreview/*` | Created | Miniaturized CV component with docx color palette, animatable keyword spans |
| `frontend/src/components/landing/LandingHero/useHeroAnimation.ts` | Created | State machine hook orchestrating 6-step animation sequence |
| `frontend/src/components/landing/LandingHero/LandingHero.tsx` | Redesigned | Split layout with CV demo, floating score gauge, keyword chips |
| `frontend/src/components/ui/KeywordChips/*` | Enhanced | Added optional stagger animation props |
| `frontend/src/components/ui/FeatureCard/*` | Enhanced | Glass variant for dark backgrounds |
| `frontend/src/components/landing/FeatureShowcase/FeatureShowcase.tsx` | Enhanced | Alternating slide-in animations, glassmorphism |
| `frontend/src/components/landing/HowItWorks/HowItWorks.tsx` | Enhanced | SVG path with scroll-driven line draw |
| `frontend/src/components/ui/StepCard/StepCard.tsx` | Enhanced | Icon pulse and badge fade-in |
| `frontend/src/components/landing/CtaFooterSection/CtaFooterSection.tsx` | Enhanced | Gradient background with noise texture |
| `frontend/src/components/landing/ProvidersSection/ProvidersSection.tsx` | Enhanced | Staggered badge animations |

## Decisions

**Fixed timers over animation callbacks** — Used predictable setTimeout chains instead of CSS animation event listeners. Simpler to debug and more reliable across browsers.

**SSR hydration strategy** — Render complete animation state server-side, reset to idle on hydration. Prevents layout shift and provides instant visual feedback.

**Glass variant pattern** — Added variant prop to FeatureCard instead of creating new component. Maintains backward compatibility while enabling glassmorphism styling.

**SVG pathLength animation** — Replaced static gradient divider with animated SVG path. Provides visual flow between steps using scroll-driven animation.

**Component-level reduced motion** — Each animated component checks `useReducedMotion()` and skips to final state. Respects user accessibility preferences.

## Session 2 — 2026-03-24

### ScoreGauge Arc Redesign
Replaced the original 3-segment circular gauge with an open-arc (240°) design inspired by credit score gauges. The arc uses 40 micro-segments with interpolated colors for a true path gradient (pinkish-red → lavender → blue → deep navy). Added an animated needle indicator. Score and label positioned inside the arc gap.

### Blue Palette Unification
Unified the landing page color language around blues:
- Matched keywords in CV demo: deep blue text + blue tint background (`rgb(40, 90, 200)`)
- Missing keyword chips below CV: pinkish-red text (`rgb(229, 77, 77)`) with pink tint background
- Keyword pulse animation: blue highlight (was green)
- Rewritten bullet background: blue tint (was green)

### Animation Synchronization
- Removed green matched keyword chips below CV
- Red/missing keyword chips now animate from t=0 alongside CV and score gauge
- Added `keywordsMissing` i18n key (EN/ES) — inverted messaging ("4 of 16 keywords missing")

### Mobile Fix
- Score gauge repositioned on mobile (`right-0` instead of `-right-6`) to prevent overflow

### Files Changed (Session 2)
| File | Action | Notes |
|------|--------|-------|
| `frontend/src/components/ui/ScoreGauge/ScoreGauge.tsx` | Rewritten | Open-arc gauge with path gradient and needle |
| `frontend/src/components/landing/CvDemoPreview/CvDemoPreview.tsx` | Modified | Blue keyword highlights (was green) |
| `frontend/src/components/landing/LandingHero/LandingHero.tsx` | Modified | Removed green chips, added missing chips at t=0, mobile fix |
| `frontend/src/app/globals.css` | Modified | keyword-pulse animation uses blue |
| `frontend/messages/en.json` | Modified | Added `keywordsMissing` key |
| `frontend/messages/es.json` | Modified | Added `keywordsMissing` key |

## Still Open

Visual QA needed in browser at all breakpoints (375px, 768px, 1440px) to verify:
- Hero animation sequence timing and visual polish
- Glassmorphism readability on dark background
- SVG line draw smoothness during scroll
- Mobile layout stacking and text readability
- Theme isolation (landing always dark regardless of toggle)

## Validation

```bash
$ cd frontend && npx tsc --noEmit
✓ No TypeScript errors

$ npm run build
✓ Compiled successfully
✓ Build passed

$ npm run lint
✔ No ESLint warnings or errors
```
