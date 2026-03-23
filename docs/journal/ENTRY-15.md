# ENTRY-15 - History Detail Accessibility and Theme Fixes

**Date:** 2026-03-23  
**Type:** Fix  
**Branch:** `feature/tailored-optimization`

---

## What I Did

Implemented a focused UI/a11y cleanup for the history detail screen and company research rendering:
- Removed duplicated back-arrow rendering in breadcrumb labels.
- Replaced dark-only colors with semantic tokens so the company research section works in light mode.
- Replaced invalid nested interactive elements with link elements styled as buttons.
- Upgraded breadcrumb semantics and current-page announcement.
- Corrected heading and landmark structure to avoid duplicate `h1` and nested `main` landmarks.

## Files Touched

| File | Action | Notes |
|------|--------|------|
| `frontend/src/app/[locale]/(app)/history/[id]/page.tsx` | Modified | Breadcrumb nav, structural semantics, CTA link/button fix |
| `frontend/src/components/ui/CompanyReport/CompanyReport.tsx` | Modified | Semantic token migration + configurable heading tag |
| `frontend/src/components/ui/CompanyReport/CompanyReport.types.ts` | Modified | New heading level prop |
| `frontend/messages/en.json` | Modified | Back-to-history label cleanup |
| `frontend/messages/es.json` | Modified | Back-to-history label cleanup |

## Decisions (rationale bullets)

- Kept the arrow as icon-only to avoid duplicate spoken/visual indicators.
- Used design-system semantic tokens to guarantee cross-theme contrast.
- Introduced a heading-level prop instead of hardcoding heading tags to preserve component reuse.

## Still Open (known gaps)

- None for this scope.

## Validation (commands + results)

- `cd frontend && npx tsc --noEmit` - pass  
- `cd frontend && npm run lint` - pass (no ESLint warnings/errors)  
- `cd frontend && npm run build` - pass (compiled and generated static pages)
