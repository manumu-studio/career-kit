# ENTRY-2 — Foundation Hardening + Test Coverage
**Date:** 2026-02-26
**Type:** Feature
**Branch:** `feature/foundation`
**Version:** `0.1.0`
---

## What I Did
- Completed `TASK-007` by adding IP-based rate limiting on `POST /optimize` (default: 10 requests per 60 seconds).
- Completed `TASK-008` by adding token usage and estimated cost logging for Anthropic calls.
- Completed `TASK-009` by adding frontend test infrastructure and broad unit/component/hook/context test coverage.
- Updated `docs/pull-requests/PR-0.1.0.md` to include all `TASK-007` through `TASK-009` changes.

## Files Touched
| File | Action | Notes |
|---|---|---|
| `backend/app/middleware/rate_limit.py` | Created | Async lock-protected in-memory limiter with 429 + `Retry-After` |
| `backend/app/main.py` | Modified | Registered rate-limit middleware after CORS |
| `backend/app/core/config.py` | Modified | Added rate-limit + LLM pricing settings |
| `backend/app/core/usage_logger.py` | Created | Structured usage logs + process-lifetime usage summary |
| `backend/app/services/llm/anthropic.py` | Modified | Extracted usage tokens and logged estimated cost |
| `backend/app/models/schemas.py` | Modified | Added `UsageMetrics` model |
| `backend/tests/test_rate_limit.py` | Created | 6 tests covering throttle behavior + window reset |
| `backend/tests/test_usage_logging.py` | Created | 5 tests for cost calc, log output, and totals |
| `frontend/vitest.config.ts` | Created | Vitest + jsdom + alias config |
| `frontend/src/test/*` | Created | Test setup, provider render helper, deterministic mocks |
| `frontend/src/**/*.test.{ts,tsx}` | Created | Utility, component, hook, and context tests |
| `docs/pull-requests/PR-0.1.0.md` | Modified | Added TASK-007/008/009 scope and validation results |

## Decisions
- Used in-memory IP throttling for MVP simplicity and no extra infra dependency.
- Logged token/cost usage as structured backend logs rather than DB persistence for initial observability.
- Standardized frontend tests on Vitest + React Testing Library for fast feedback and user-centric assertions.

## Still Open
- Rate limiting and usage totals are process-local (reset on restart and not shared across multi-instance deployments).
- `PACKET-02` (`feature/company-intelligence`) remains next and is not started.

## Validation
### Frontend
```bash
cd frontend
npm run test
npx tsc --noEmit
npm run build
npm run lint
```
- `npm run test`: pass (`50` tests)
- `npx tsc --noEmit`: pass
- `npm run build`: pass
- `npm run lint`: pass

### Backend
```bash
cd backend
python3 -m ruff check .
python3 -m ruff format --check .
python3 -m mypy app/
python3 -m pytest
```
- `ruff check`: pass
- `ruff format --check`: pass
- `mypy app/`: pass
- `pytest`: pass (`23` tests)
