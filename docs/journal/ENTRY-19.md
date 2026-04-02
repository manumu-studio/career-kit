# ENTRY-19 — Frontend TypeScript Quality Hardening
**Date:** 2026-04-02
**Type:** Infrastructure
**Branch:** `feature/typescript-quality-remediation`
**Version:** `0.18.0`

---

## What I Did

Tightened the Next.js frontend TypeScript configuration with the remaining strict compiler flags (including `exactOptionalPropertyTypes`) and fixed every surfaced error by passing optional props correctly—no explicit `undefined` where a property should be omitted—and by normalizing navbar and form-related option objects.

Introduced Zod schemas for backend JSON responses and wired the API client to parse successful and error bodies at the boundary, so runtime shape mismatches fail with clear errors instead of silent bad state. Inferred public types for optimization, history, company research, providers, and cover letter payloads now come from those schemas.

Hardened authentication callbacks by validating OIDC profile payloads with Zod and handling both `sub` and `id` when the identity provider hands NextAuth a normalized user object.

Split the home upload page into a dedicated hook (`useHomePage`) and a small `CompareProvidersPanel` component so the route file stays maintainable and under the line-count guideline, without changing user-visible behavior.

Removed remaining unsafe type assertions in context, hooks, comparison UI, history helpers, and the locale-aware link by using type guards and small `hasOwnProperty`-based property readers where JSON is only known at runtime.

Moved inline component prop interfaces into `.types.ts` files for `LinkWithSpinner`, `SubmitButtonWithSpinner`, and `CtaFooterSection` to match the project’s component structure conventions.

## Files Touched

| File | Action | Notes |
|------|--------|-------|
| `frontend/tsconfig.json` | Modified | Additional strict flags |
| `frontend/playwright.config.ts` | Modified | Optional `workers` for strict optional rules |
| `frontend/src/lib/schemas/*` | Created | API and OIDC Zod schemas + barrel |
| `frontend/src/lib/api.ts` | Modified | Parse responses; export option types |
| `frontend/src/lib/api-errors.ts` | Modified | Error body type from schema |
| `frontend/src/types/*.ts` | Modified | Re-export inferred API types |
| `frontend/src/features/auth/*` | Modified | OIDC parsing, JWT field typing |
| `frontend/src/app/[locale]/(app)/home/page.tsx` | Modified | Composition-only page |
| `frontend/src/app/[locale]/(app)/home/useHomePage.ts` | Created | State and handlers |
| `frontend/src/components/app/CompareProvidersPanel/*` | Created | Compare UI slice |
| `frontend/src/context/OptimizationContext.tsx` | Modified | Provider guard, storage hydrate |
| `frontend/src/components/ui/ProviderSelector/useProviderSelector.ts` | Modified | Provider guard |
| `frontend/src/components/ui/ProviderComparison/ProviderComparison.tsx` | Modified | Comparison entry guards |
| `frontend/src/app/[locale]/(app)/history/compare/page.tsx` | Modified | JSON guards without casts |
| `frontend/src/app/[locale]/(app)/history/[id]/page.tsx` | Modified | Same |
| `frontend/src/components/ui/CompanySearch/*` | Modified | Guards, research options |
| `frontend/src/components/ui/LinkWithSpinner/*` | Modified | Types file; locale `href` |
| `frontend/src/components/ui/SubmitButtonWithSpinner/*` | Modified | Types file |
| `frontend/src/components/landing/CtaFooterSection/*` | Modified | Types file |
| Additional app/layout/results/public/history/components | Modified | `exactOptionalPropertyTypes` fixes |

## Decisions

**Single `parseApiResponse` helper** — Keeps Zod failures mapped to consistent, user-agnostic error messages at the client boundary without duplicating try/catch at every call site.

**`.passthrough()` on response schemas** — Allows the backend to add fields without breaking the client until types are updated.

**Module-level guards in `useCompanySearch`** — Satisfies hook dependency linting and keeps research JSON validation stable across renders.

## Still Open

- Optional: run a fresh TypeScript quality audit checklist against the repo to confirm 8/8 categories pass with the team’s tooling.
- Manual smoke test of sign-in, upload, history, and compare flows after merge.

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```

All passed on 2026-04-02.
