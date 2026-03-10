# ENTRY-11 — Design System Foundation

**Date:** 2026-03-10
**Type:** Feature
**Branch:** `feature/design-system`
**Version:** 0.12.0

---

## What I Did

Introduced a design system for Career Kit: ShadCN/ui components, next-themes for dark/light mode, Framer Motion for animations, and Raleway typography. Added a new Navbar with glass blur, ThemeToggle, and mobile drawer. Migrated core components (buttons, inputs, selects, badges, skeletons) to ShadCN primitives and replaced hardcoded colors with design tokens.

## Files Touched

| File | Action | Notes |
|------|--------|-------|
| `frontend/package.json` | Modified | next-themes, framer-motion, @fontsource-variable/raleway, ShadCN deps |
| `frontend/components.json` | Created | ShadCN config |
| `frontend/tailwind.css` | Created | Theme variables, ShadCN base |
| `frontend/src/app/globals.css` | Modified | Font import, tailwind import, focus-visible, ai-gradient |
| `frontend/src/app/layout.tsx` | Modified | ThemeProvider, TooltipProvider |
| `frontend/src/app/[locale]/(app)/layout.tsx` | Modified | Navbar replaces UserBar |
| `frontend/src/app/[locale]/(public)/layout.tsx` | Modified | Navbar (public mode) |
| `frontend/src/components/providers/theme-provider.tsx` | Created | next-themes wrapper |
| `frontend/src/components/ui/Navbar/*` | Created | Navbar, useNavbar, types |
| `frontend/src/components/ui/ThemeToggle/*` | Created | ThemeToggle |
| `frontend/src/components/ui/ProviderSelector/ProviderSelector.tsx` | Modified | ShadCN Select |
| `frontend/src/components/ui/LoadingSkeleton/LoadingSkeleton.tsx` | Modified | ShadCN Skeleton |
| `frontend/src/components/ui/JobDescription/JobDescription.tsx` | Modified | ShadCN Textarea |
| `frontend/src/components/ui/LanguageSwitcher/LanguageSwitcher.tsx` | Modified | Design tokens |
| `frontend/src/components/ui/CacheHitBanner/CacheHitBanner.tsx` | Modified | ShadCN Button |
| `frontend/src/components/ui/HistoryList/HistoryList.tsx` | Modified | ShadCN Input, Button |
| `frontend/src/components/ui/HistoryCard/HistoryCard.tsx` | Modified | ShadCN Button, Badge |
| `frontend/src/components/ui/ExportToolbar/ExportToolbar.tsx` | Modified | ShadCN Button |
| `frontend/src/app/[locale]/(app)/home/page.tsx` | Modified | ShadCN Button, design tokens |
| `frontend/messages/en.json` | Modified | navbar translations |
| `frontend/messages/es.json` | Modified | navbar translations |
| `frontend/src/components/ui/ProviderSelector/ProviderSelector.test.tsx` | Modified | ShadCN Select test updates |

## Decisions (rationale bullets)

- **ShadCN base-nova**: Uses @base-ui/react; compatible with Tailwind v4 and React 19
- **Raleway variable font**: Single file covers weights 100–900; avoids multiple font requests
- **Design tokens in tailwind.css**: Centralized theme; dark/light via `.dark` class
- **Navbar with glass blur**: `backdrop-blur-md` + `bg-background/80` for modern app-shell look
- **UserBar retained**: Not deleted; Navbar replaces its usage in layouts

## Still Open (known gaps)

- ScoreCard, CvComparison, GapAnalysis, KeywordMatch, landing page not migrated (deferred)
- Some components (CompanyReport, CompanyCard, etc.) still use hardcoded colors; full migration in later work

## Validation (commands + results)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint && npm run test
# ✓ Compiled successfully
# ✔ No ESLint warnings or errors
# Test Files  36 passed (36)
#      Tests  160 passed (160)
```
