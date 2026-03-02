# PR-0.2.0 — Company Intelligence Guardrails and Reliability
**Branch:** `feature/company-intelligence` → `main`
**Version:** `0.2.0`
**Date:** 2026-03-02
**Status:** ✅ Ready to merge
---

## Summary
- Finalizes PACKET-02 stabilization by implementing security, budget, and reliability fixes for company research.
- Adds complete research test coverage (38 new tests), raising backend suite total to 62 passing tests.
- Resolves deprecated DDG package behavior by migrating fallback search to `ddgs`.
- Improves endpoint responsiveness by running scrape/search concurrently and enforcing a 45-second timeout.

## Files Changed
| File | Action | Notes |
|---|---|---|
| `backend/app/services/research/website_scraper.py` | Modified | SSRF protections, URL length guardrail, redirect hardening |
| `backend/app/services/research/search_aggregator.py` | Modified | DDG provider migration (`ddgs`), capped results, provider error logging |
| `backend/app/services/research/synthesizer.py` | Modified | Capped source collection |
| `backend/app/routers/research.py` | Modified | Concurrent scrape/search and endpoint timeout handling |
| `backend/requirements.txt` | Modified | Added `pytest-httpx`, replaced DDG dependency with `ddgs` |
| `backend/tests/test_website_scraper.py` | Added | Scraper unit tests (11) |
| `backend/tests/test_search_aggregator.py` | Added | Aggregator/provider unit tests (10) |
| `backend/tests/test_synthesizer.py` | Added | Synthesizer unit tests (9) |
| `backend/tests/test_research_endpoint.py` | Added | Endpoint integration tests (8) |
| `backend/tests/test_rate_limit.py` | Modified | Added OPTIONS preflight bypass test |
| `docs/cursor-task-reports/TASK-015-report.md` | Added | Task report |
| `docs/cursor-task-reports/TASK-016-report.md` | Added | Task report |
| `docs/cursor-task-reports/TASK-017-report.md` | Added | Task report |
| `docs/journal/ENTRY-1.md` | Added | Feature journal entry |

## Architecture Decisions
| Decision | Why |
|---|---|
| Block internal/private network targets in scraper | Prevent SSRF-style access to loopback/private hosts |
| Enforce max result/source caps of 10 | Control cost and context size per research run |
| Use `ddgs` over `duckduckgo-search` | Deprecated package produced zero-result failures locally |
| Use `asyncio.gather` for scrape + search | Reduce end-to-end latency for independent I/O operations |
| Add 45s global pipeline timeout | Prevent unbounded request times and improve client behavior |

## Testing Checklist
- [x] Existing backend tests remain green.
- [x] New research tests pass independently.
- [x] Lint and format checks pass.
- [x] Type checks pass on backend app code.
- [x] DDGS smoke check returns non-empty results.
- [x] OPTIONS preflight bypass behavior covered by tests.

## Deployment Notes
- Ensure backend environment installs updated dependencies (`ddgs` present).
- Restart backend service after dependency refresh.
- No API contract changes to request schema; timeout path now explicitly returns HTTP 504.

## Validation
```bash
cd backend && python3 -m pip install ddgs
cd backend && python3 -m ruff check . && python3 -m ruff format --check . && python3 -m mypy app/ && python3 -m pytest
```
- `ruff check`: pass
- `ruff format --check`: pass
- `mypy app/`: pass
- `pytest`: pass (`62 passed`)

```bash
cd backend && python3 -c "from ddgs import DDGS; print(DDGS().text('Google reviews', max_results=2))"
```
- DDGS smoke test: pass (returns >0 results)
# PR-0.2.0 — Company Intelligence
**Branch:** `feature/company-intelligence`
**Version:** `0.2.0`
**Date:** 2026-03-02
**Status:** ✅ Ready for review
---

## Summary
- Delivers PACKET-02 company intelligence flow:
  - company research input on upload page
  - backend research pipeline (`/research-company`)
  - full report page (`/report`)
  - optimize endpoint integration with optional company context
- Adds new frontend company components and shared company type contracts.
- Extends backend prompts, schemas, and provider interfaces for company-aware optimization and synthesis.

## Scope Included
| Task | Status |
|---|---|
| `TASK-010` Website scraper service | ✅ |
| `TASK-011` Search aggregator | ✅ |
| `TASK-012` Synthesizer + research endpoint | ✅ |
| `TASK-013` Company research UI | ✅ |
| `TASK-014` Report page + optimize integration | ✅ |

## Files Changed
| Area | Highlights |
|---|---|
| Frontend types/API | `src/types/company.ts`, `src/lib/api.ts` |
| Frontend research UI | `CompanySearch`, `ResearchProgress`, `CompanyCard` |
| Frontend report UI | `CompanyReport`, `KeywordChips`, `app/report/page.tsx` |
| Frontend state | `OptimizationContext` extended with company research persistence |
| Backend research pipeline | `services/research/*`, `routers/research.py` |
| Backend optimize integration | `routers/optimize.py`, `core/prompts.py`, `services/llm/*`, `models/schemas.py` |
| Backend infra/config | `core/config.py`, `main.py`, `middleware/rate_limit.py`, `requirements.txt` |

## Architecture Decisions
| Decision | Why |
|---|---|
| Tavily primary + DuckDuckGo fallback | Better quality when key exists, still works without key |
| Optional company context in optimize API | Keeps backward compatibility for non-research flow |
| SessionStorage persistence for company research | Enables upload/report navigation continuity |
| Prompt-level company tailoring | Improves optimization relevance without changing response schema |

## Testing Checklist
- [x] `cd frontend && npx tsc --noEmit`
- [x] `cd frontend && npm run lint`
- [x] `cd frontend && NEXT_PUBLIC_API_URL=http://localhost:8000 npm run build`
- [x] `cd backend && python3 -m ruff check .`
- [x] `cd backend && python3 -m ruff format --check .`
- [x] `cd backend && python3 -m mypy app/`
- [x] `cd backend && python3 -m pytest`

## Deployment Notes
- Required backend env:
  - `ANTHROPIC_API_KEY`
- Optional backend env:
  - `TAVILY_API_KEY` (falls back to DuckDuckGo if missing)
- Frontend env:
  - `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Validation
```bash
cd frontend && npx tsc --noEmit && npm run lint && NEXT_PUBLIC_API_URL=http://localhost:8000 npm run build
cd backend && python3 -m ruff check . && python3 -m ruff format --check . && python3 -m mypy app/ && python3 -m pytest
```
- Frontend: pass
- Backend: pass (`23` tests)

## References
- `docs/cursor-task-reports/TASK-010-report.md`
- `docs/cursor-task-reports/TASK-011-report.md`
- `docs/cursor-task-reports/TASK-012-report.md`
- `docs/cursor-task-reports/TASK-013-report.md`
- `docs/cursor-task-reports/TASK-014-report.md`
