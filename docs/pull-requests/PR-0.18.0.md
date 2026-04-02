# PR-0.18.0 — Frontend TypeScript Quality Hardening
**Branch:** `feature/typescript-quality-remediation` → `main`
**Version:** `0.18.0`
**Date:** 2026-04-02
**Status:** ✅ Ready to merge

---

## Summary

Raises frontend type safety and runtime validation without product or UX changes: stricter `tsconfig` (including `exactOptionalPropertyTypes`), Zod-backed parsing for all API JSON responses, OIDC profile validation in auth callbacks, decomposition of the home upload route into a hook and a compare-providers panel component, removal of unsafe `as` assertions in favor of guards, and `.types.ts` files for three UI components that previously inlined props.

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `frontend/tsconfig.json` | Modified | Stricter compiler options |
| `frontend/playwright.config.ts` | Modified | Config compatible with strict optionals |
| `frontend/src/lib/schemas/*` | Created | Zod schemas + exports |
| `frontend/src/lib/api.ts` | Modified | Validated responses |
| `frontend/src/lib/api-errors.ts` | Modified | Shared error body typing |
| `frontend/src/types/*.ts` | Modified | Types aligned with schemas |
| `frontend/src/features/auth/*` | Modified | Profile parsing, JWT typing |
| `frontend/src/app/[locale]/(app)/home/*` | Modified / Created | `useHomePage`, thinner page |
| `frontend/src/components/app/CompareProvidersPanel/*` | Created | Extracted compare controls |
| `frontend/src/context/OptimizationContext.tsx` | Modified | Safer hydrate + provider guard |
| `frontend/src/components/ui/ProviderSelector/useProviderSelector.ts` | Modified | Provider guard |
| `frontend/src/components/ui/ProviderComparison/ProviderComparison.tsx` | Modified | Comparison guards |
| `frontend/src/app/[locale]/(app)/history/*` | Modified | JSON guards |
| `frontend/src/components/ui/CompanySearch/*` | Modified | Cached research validation |
| `frontend/src/components/ui/LinkWithSpinner/*` | Modified | Props types |
| `frontend/src/components/ui/SubmitButtonWithSpinner/*` | Modified | Props types |
| `frontend/src/components/landing/CtaFooterSection/*` | Modified | Props types |
| Other `frontend/src/**` | Modified | Strict optional and lint fixes |

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Zod at the API boundary | One place to detect backend drift; keeps components free of `unknown` sprawl |
| Inferred types from schemas | Single source of truth for response shapes |
| Hook + panel extraction on home | Keeps the route file small and testable without changing behavior |
| `readUnknownProp` for stored JSON | Avoids assertions when reading loosely typed history blobs |

## Testing Checklist

- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run build`
- [ ] Sign in and confirm session still populates name and email
- [ ] Run optimization end-to-end (upload, results)
- [ ] Optional company research and cache banner paths
- [ ] History list, detail, and compare-from-history flows
- [ ] Multi-provider compare from home
- [ ] English and Spanish locales on touched routes

## Deployment Notes

- Frontend-only; no new environment variables.
- No database or API contract changes required; schemas match current backend responses.

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```

All succeeded on 2026-04-02.
