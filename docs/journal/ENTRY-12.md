# ENTRY-12 — Landing Page Redesign & CV Language Auto-Detection

**Date:** 2026-03-10
**Type:** Feature
**Branch:** `feature/landing-redesign`
**Version:** `0.13.0`

---

## What I Did

Redesigned the landing page into a conversion-focused entry point and added automatic CV language detection on the backend.

**Landing page:**
- Hero section with animated headline ("Land the right job, prepared."), subheadline, dual CTAs (Get Started / See how it works), AI gradient accent, social proof
- Feature showcase: 3 cards (CV Optimization, Cover Letter, Company Intelligence) with alternating layout and CSS mockups
- How It Works: 3-step flow (Upload CV → Paste JD → Get package)
- Providers section: Anthropic, OpenAI, Gemini badges
- CTA footer with gradient button and trust line
- Site footer with logo, Home/Privacy/Terms links, "Built by ManuMu Studio"

**Backend:**
- Heuristic language detection from CV text (stopword-based, no LLM)
- Resolution: user override > detected > UI locale fallback
- Applied to optimize, cover-letter, compare endpoints
- Added `detected_language` to optimization response

## Files Touched

| File | Action | Notes |
|------|--------|-------|
| .husky/pre-push | Created | Pre-push hook mirrors CI (frontend + backend) |
| AnimatedText, FeatureCard, StepCard, Footer | Created | UI components |
| LandingHero, FeatureShowcase, HowItWorks, ProvidersSection, CtaFooterSection | Created | Landing sections |
| (public)/page.tsx, (public)/layout.tsx | Modified | Page + SEO |
| en.json, es.json | Modified | Landing translations |
| language_detector.py | Created | Backend detection |
| i18n.py, optimize, cover_letter, providers | Modified | Language resolution |

## Decisions (rationale bullets)

- **Pre-push hook**: Mirrors GitHub Actions CI locally; skips frontend/backend if unchanged
- **LazyMotion**: Smaller Framer Motion bundle
- **Stopword heuristic**: Zero cost, fast, good enough for en/es
- **OG metadata**: Placeholder image path; can replace later

## Still Open (known gaps)

- OG image (`/og-image.png`) is placeholder
- Privacy/Terms links are `#` placeholders

## Validation (commands + results)

- Frontend: `npx tsc --noEmit && npm run build && npm run lint && npm run test` — pass
- Backend: `pytest` — 124 passed
