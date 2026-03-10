# PR-0.12.0 — Landing Page Redesign & CV Language Auto-Detection

**Branch:** `feature/landing-redesign` → `main`
**Version:** `0.12.0`
**Date:** 2026-03-10
**Status:** ✅ Ready to merge

---

## Summary

Redesigned the landing page into a conversion-optimized entry point with hero, feature showcase, how-it-works, providers, CTA footer, and site footer. Added automatic CV language detection on the backend so Spanish CVs produce Spanish output even when the UI is in English.

## Files Changed

| File                                                                         | Action   | Notes                                         |
| ---------------------------------------------------------------------------- | -------- | --------------------------------------------- |
| .husky/pre-push                                                              | Created  | Pre-push hook mirrors CI (frontend + backend) |
| AnimatedText, FeatureCard, StepCard, Footer                                  | Created  | UI components                                 |
| LandingHero, FeatureShowcase, HowItWorks, ProvidersSection, CtaFooterSection | Created  | Landing sections                              |
| (public)/page.tsx, (public)/layout.tsx                                       | Modified | Page + SEO metadata                           |
| en.json, es.json                                                             | Modified | Landing translations                          |
| language_detector.py                                                         | Created  | Heuristic en/es detection                     |
| i18n.py, optimize, cover_letter, providers, schemas                          | Modified | Language resolution                           |
| test_language_detector.py                                                    | Created  | 9 unit tests                                  |

## Architecture Decisions

| Decision                                   | Why                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| Pre-push hook mirrors CI                   | Runs frontend/backend checks locally before push; skips unchanged areas |
| LazyMotion + domAnimation                  | Reduces Framer Motion bundle size                                       |
| Stopword-based language detection          | Zero LLM cost, < 10ms, good for en/es                                   |
| Resolution: override > detected > fallback | User choice wins; CV language beats UI locale                           |
| generateMetadata in (public) layout        | SEO for landing; OG, Twitter, canonical                                 |

## Testing Checklist

- [x] Hero renders, animations play, CTAs work
- [x] Feature cards and How It Works scroll animations
- [x] Providers, CTA footer, Footer render
- [x] Spanish CV → Spanish output; English CV → English output
- [x] EN/ES locale switching
- [x] Frontend build, lint, tests pass
- [x] Backend pytest pass

## Deployment Notes

- Set `NEXT_PUBLIC_APP_URL` for correct OG/canonical URLs
- Add `/og-image.png` for social sharing (placeholder path used)

## Validation (commands + results)

- Frontend: `npx tsc --noEmit && npm run build && npm run lint && npm run test` — pass
- Backend: `pytest` — 124 passed
