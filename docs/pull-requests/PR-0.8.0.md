# PR-0.8.0 — Testing Suite

**Branch:** `feature/testing-suite` → `main`
**Version:** `0.8.0`
**Date:** 2026-03-09
**Status:** ✅ Ready to merge
---
## Summary

Adds a full testing suite: Vitest + RTL + MSW for frontend (160 tests, 79.9% coverage), pytest for backend (105 tests, 71% coverage), and Playwright for E2E (7 spec files). Coverage thresholds enforced; frontend and backend CI run tests with coverage.

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| frontend/src/test/msw/* | Created | MSW handlers, server |
| frontend/src/test/mocks.ts, setup.ts | Modified | Factories, lifecycle |
| frontend/vitest.config.ts | Modified | Coverage |
| 19× ComponentName.test.tsx | Created | Component tests |
| useHistoryList.test.ts, useProviderSelector.test.ts | Created | Hook tests |
| backend/tests/conftest.py | Created | Shared fixtures |
| backend/tests/test_history.py, test_cache_service.py, test_factory.py, test_prompts.py, test_config.py | Created | New tests |
| backend/tests/test_cover_letter.py, test_optimize.py, test_schemas.py, test_pdf_parser.py | Modified | Expanded |
| backend/tests/fixtures/* | Created | PDF fixtures |
| frontend/playwright.config.ts | Created | E2E config |
| frontend/e2e/*.spec.ts | Created | E2E specs |
| frontend/src/app/(app)/layout.tsx | Modified | E2E auth bypass |
| backend/pyproject.toml | Modified | pytest coverage |
| .github/workflows/backend-ci.yml | Modified | Coverage in CI |
| .github/workflows/frontend-ci.yml | Created | tsc, lint, unit tests, coverage |
| package.json, .gitignore | Modified | Scripts, artifacts |

## Architecture Decisions

| Decision | Why |
|----------|-----|
| MSW for frontend | No real API calls in unit tests |
| Coverage scope (components, context, lib) | Meet 70% without testing Next.js internals |
| E2E auth bypass | Run protected flows without OAuth |
| E2E port 3010 | Avoid dev server conflict |

## Testing Checklist

- [x] Frontend unit tests pass
- [x] Frontend coverage ≥70%
- [x] Backend tests pass
- [x] Backend coverage ≥70%
- [x] E2E config and specs in place
- [x] CI runs frontend and backend coverage

## Deployment Notes

No deployment changes. E2E tests run locally; CI does not run E2E by default.

## Validation (commands + results)

```bash
cd frontend && npm run test:coverage  # 160 passed
cd backend && pytest --cov=app --cov-fail-under=70  # 105 passed
```
