# PR-0.12.0 — Design System Foundation

**Branch:** `feature/design-system` → `main`
**Version:** 0.12.0
**Date:** 2026-03-10
**Status:** ✅ Ready to merge

---

## Summary

Introduces a design system for Career Kit: ShadCN/ui components, next-themes for dark/light mode, Framer Motion, and Raleway typography. Adds a new Navbar with ThemeToggle and mobile drawer. Migrates core components to ShadCN primitives and design tokens.

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `frontend/package.json` | Modified | next-themes, framer-motion, @fontsource-variable/raleway, ShadCN |
| `frontend/components.json` | Created | ShadCN config |
| `frontend/tailwind.css` | Created | Theme variables |
| `frontend/src/app/globals.css` | Modified | Font, tailwind import, ai-gradient |
| `frontend/src/app/layout.tsx` | Modified | ThemeProvider, TooltipProvider |
| `frontend/src/app/[locale]/(app)/layout.tsx` | Modified | Navbar replaces UserBar |
| `frontend/src/app/[locale]/(public)/layout.tsx` | Modified | Navbar (public) |
| `frontend/src/components/providers/theme-provider.tsx` | Created | next-themes wrapper |
| `frontend/src/components/ui/Navbar/*` | Created | Navbar, useNavbar |
| `frontend/src/components/ui/ThemeToggle/*` | Created | ThemeToggle |
| `frontend/src/components/ui/ProviderSelector/ProviderSelector.tsx` | Modified | ShadCN Select |
| `frontend/src/components/ui/LoadingSkeleton/LoadingSkeleton.tsx` | Modified | ShadCN Skeleton |
| `frontend/src/components/ui/JobDescription/JobDescription.tsx` | Modified | ShadCN Textarea |
| `frontend/src/components/ui/LanguageSwitcher/LanguageSwitcher.tsx` | Modified | Design tokens |
| `frontend/src/components/ui/CacheHitBanner/CacheHitBanner.tsx` | Modified | ShadCN Button |
| `frontend/src/components/ui/HistoryList/HistoryList.tsx` | Modified | ShadCN Input, Button |
| `frontend/src/components/ui/HistoryCard/HistoryCard.tsx` | Modified | ShadCN Button, Badge |
| `frontend/src/components/ui/ExportToolbar/ExportToolbar.tsx` | Modified | ShadCN Button |
| `frontend/src/app/[locale]/(app)/home/page.tsx` | Modified | ShadCN Button |
| `frontend/messages/en.json` | Modified | navbar translations |
| `frontend/messages/es.json` | Modified | navbar translations |
| `frontend/src/components/ui/ProviderSelector/ProviderSelector.test.tsx` | Modified | Test updates |

## Architecture Decisions

| Decision | Why |
|----------|-----|
| ShadCN base-nova | Tailwind v4 + React 19 compatible; @base-ui/react primitives |
| next-themes | System preference support, persistence, minimal bundle |
| Raleway variable font | Single file, weights 100–900 |
| Navbar replaces UserBar | Unified app shell with theme toggle, language, user menu |

## Testing Checklist

- [ ] Toggle dark/light mode on home, history, results pages
- [ ] Test mobile nav drawer (hamburger → sheet)
- [ ] Verify Raleway font renders
- [ ] Check ProviderSelector dropdown works
- [ ] Verify all buttons, inputs use ShadCN styling
- [ ] Run `cd frontend && npm run test`

## Deployment Notes

No backend changes. Frontend only.

## Validation (commands + results)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint && npm run test
# ✓ Compiled successfully
# ✔ No ESLint warnings or errors
# Test Files  36 passed (36)
#      Tests  160 passed (160)
```
