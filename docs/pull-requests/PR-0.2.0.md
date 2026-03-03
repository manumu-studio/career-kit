# PR-0.2.0 — Company Intelligence & Form State Persistence
**Branch:** `feature/company-intelligence` → `main`
**Version:** `0.2.0`
**Date:** 2026-03-03
**Status:** ✅ Ready to merge
---

## Summary
- Delivers the full company intelligence flow: research input on the upload page, backend research pipeline, full report page, and integration with the optimize endpoint.
- Hardens the research backend with SSRF protections, concurrent I/O, a 45 s global timeout, and migrated search provider.
- Adds form state persistence so company name, URL, job title, job description, and previously selected file name survive navigation.
- Adds 39 new backend tests, raising the suite to 62 passing tests.

---

## Scope

### Company Intelligence
| Feature | Notes |
|---|---|
| Website scraper | SSRF protections, URL length guardrail, redirect hardening |
| Search aggregator | Tavily primary + DuckDuckGo (`ddgs`) fallback, capped at 10 results per provider |
| LLM synthesizer | Capped source collection, structured company profile output |
| `POST /research-company` | Scrape + search run concurrently via `asyncio.gather`; 45 s timeout returns HTTP 504 |
| Company research UI | Input form, step-by-step progress visualization, compact summary card |
| `/report` page | Full company intelligence report with copyable keyword chips |
| Optimize integration | Optional company context fields for tailored CV output |
| Company research persistence | `sessionStorage` for upload → report navigation continuity |

### Form State Persistence
| Feature | Notes |
|---|---|
| `FormState` in context | `companyName`, `companyUrl`, `jobTitle`, `jobDescription`, `fileName` |
| `sessionStorage` under `ats-form-state-v1` | Survives page refreshes and back navigation |
| Hydration on mount | `useRef` guard; initialises once after provider loads from storage |
| File name hint | Shows "Previously selected: X — please re-select" when file object is gone |
| `clearFormState` | Exposed on context for explicit reset; UI trigger deferred to next UX pass |

---

## Files Changed

### Frontend
| File | Action | Notes |
|---|---|---|
| `src/app/page.tsx` | Modified | Research → optimize → report flow; job description + file state persistence |
| `src/app/report/page.tsx` | Created | Company intelligence report route |
| `src/context/OptimizationContext.tsx` | Modified | Company research + form state slices with sessionStorage |
| `src/types/company.ts` | Created | Company research type contracts |
| `src/lib/api.ts` | Modified | Research API + optional company context in optimize call |
| `src/components/ui/CompanySearch/*` | Created | Research form, `useCompanySearch` hook with context sync |
| `src/components/ui/ResearchProgress/*` | Created | Step-by-step research progress |
| `src/components/ui/CompanyCard/*` | Created | Compact research summary card |
| `src/components/ui/CompanyReport/*` | Created | Full report renderer |
| `src/components/ui/KeywordChips/*` | Created | Copyable keyword chip list |

### Backend
| File | Action | Notes |
|---|---|---|
| `app/services/research/website_scraper.py` | Created / Modified | SSRF protections, URL length guardrail, redirect hardening |
| `app/services/research/search_aggregator.py` | Created / Modified | `ddgs` migration, capped results, provider error logging |
| `app/services/research/synthesizer.py` | Created / Modified | LLM synthesis, capped source collection |
| `app/routers/research.py` | Created | Concurrent scrape/search and timeout handling |
| `app/routers/optimize.py` | Modified | Optional company context form fields |
| `app/core/prompts.py` | Modified | Company research + company-aware optimization prompts |
| `app/models/schemas.py` | Modified | Company, search, and website schemas |
| `backend/requirements.txt` | Modified | Added `ddgs`, `pytest-httpx`; removed deprecated DDG package |
| `tests/test_website_scraper.py` | Added | 11 scraper unit tests |
| `tests/test_search_aggregator.py` | Added | 10 aggregator/provider unit tests |
| `tests/test_synthesizer.py` | Added | 9 synthesizer unit tests |
| `tests/test_research_endpoint.py` | Added | 8 endpoint integration tests |
| `tests/test_rate_limit.py` | Modified | Added OPTIONS preflight bypass test |

---

## Architecture Decisions
| Decision | Why |
|---|---|
| Block internal/private targets in scraper | Prevent SSRF-style access to loopback/private hosts |
| Cap results and sources at 10 | Control LLM cost and context window size per research run |
| `ddgs` over `duckduckgo-search` | Deprecated package produced zero-result failures |
| `asyncio.gather` for scrape + search | Independent I/O — run concurrently to reduce latency |
| 45 s global pipeline timeout | Prevents unbounded request time; returns HTTP 504 to client |
| Tavily primary + DuckDuckGo fallback | Quality with a key, still functional without one |
| `useRef` hydration guard in hooks | Initialises local state from context exactly once without extra renders |
| `useCallback` on `handleFileChange` | `FileUpload` lists `onFileChange` as a `useEffect` dep — plain function reference causes infinite re-render loop |

---

## Testing Checklist
- [x] Existing backend tests remain green
- [x] New research tests pass independently
- [x] Lint and format checks pass
- [x] Type checks pass (backend and frontend)
- [x] DDGS smoke check returns non-empty results
- [x] OPTIONS preflight bypass covered by tests
- [x] Form state hydrates correctly after back navigation

---

## Deployment Notes
- Install updated backend dependencies (`ddgs` package required).
- Restart backend service after dependency refresh.
- No API contract changes to optimize request schema.
- Timeout path now explicitly returns HTTP 504.
- Optional: set `TAVILY_API_KEY` for higher-quality research results (falls back to DuckDuckGo if absent).

---

## Validation
```bash
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```
- `tsc --noEmit`: pass
- `lint`: pass
- `build`: pass

```bash
cd backend && python3 -m ruff check . && python3 -m ruff format --check . && python3 -m mypy app/ && python3 -m pytest
```
- `ruff check`: pass
- `ruff format --check`: pass
- `mypy app/`: pass
- `pytest`: pass (62 tests)
