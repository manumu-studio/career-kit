# ENTRY-14 — Tailored Optimization Flow

**Date:** 2026-03-11
**Type:** Feature
**Branch:** `feature/tailored-optimization`
**Version:** `0.14.0`

---

## What I Did

Split the landing page into two clear entry points: **Quick Optimize** (CV + job description only) and **Tailor for a Company** (CV + job description + company intelligence). Both lead to the same home page with different initial states.

**Landing:** Hero now has two CTAs side by side — primary "Optimize My CV" (gradient) and secondary "Tailor for a Company" (outline with sparkle icon). FeatureShowcase cards updated to market Quick Optimize, Company-Tailored, and Cover Letter.

**Home:** When arriving via `?mode=tailor`, company research section starts expanded with a highlighted border and callout banner. Submit button shows "Tailor & Optimize CV" when research is loaded; badge appears on the Submit step.

**Results:** Company-tailored badge when optimization used company context.

**Backend:** Enhanced LLM prompt to use more CompanyProfile fields (mission_statement, tech_stack, industry) when available.

## Files Touched

| File | Action | Notes |
|------|--------|------|
| frontend/src/app/[locale]/(public)/page.tsx | Modified | Dual CTAs |
| frontend/src/app/[locale]/(app)/home/page.tsx | Modified | mode=tailor logic |
| frontend/src/app/[locale]/(app)/results/page.tsx | Modified | Company-tailored badge |
| frontend/messages/en.json | Modified | New keys |
| frontend/messages/es.json | Modified | New keys |
| backend/app/core/prompts.py | Modified | Enhanced company context |

## Decisions (rationale bullets)

- **companyResearch for badge:** OptimizationResult schema does not include company_name; using companyResearch from context indicates company-tailored optimization was used.
- **Dynamic company prompt:** Only includes mission_statement, tech_stack, industry when data is available.

## Still Open (known gaps)

- None

## Validation (commands + results)

- Frontend: `npx tsc --noEmit && npm run build && npm run lint && npm run test` — 171 tests pass
- Backend: `ruff check . && ruff format --check . && mypy app/ && pytest` — 124 tests pass, 72% coverage
