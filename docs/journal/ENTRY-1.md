# ENTRY-1 — Foundation, Hardening & Company Intelligence
**Dates:** 2026-02-25 → 2026-03-02
**Type:** Feature
**Branches:** `feature/foundation` → `feature/company-intelligence`
**Versions:** `0.1.0` → `0.2.0`
---

## What I Built

### Foundation (0.1.0)
- End-to-end ATS optimization flow: upload PDF + job description → LLM processing → structured results display.
- Frontend scaffold with strict TypeScript, Tailwind v4, App Router, and env validation.
- Backend scaffold with FastAPI, Pydantic settings, multipart upload handling, and a typed optimize endpoint.
- PDF text extraction with `pdfplumber` and validation guardrails.
- LLM provider abstraction (ABC base + factory) with Anthropic as the first concrete implementation.
- Results page with score card, keyword match analysis, gap analysis, and side-by-side CV comparison.
- Cross-page result state managed via React context + `sessionStorage` hydration.
- IP-based in-memory rate limiting on `POST /optimize` (10 requests / 60 s, `Retry-After` header).
- Structured LLM token usage and estimated cost logging on every Anthropic call.
- Frontend test suite (Vitest + React Testing Library) and backend test coverage expansion.

### Company Intelligence (0.2.0)
- Backend research pipeline: website scraper with SSRF protections, public search aggregator (Tavily primary / DuckDuckGo fallback), and LLM synthesizer.
- `POST /research-company` endpoint — runs scrape and search concurrently with a 45 s global timeout and degrades gracefully on partial failures.
- Company research UI on the upload page: input form, step-by-step progress visualization, and compact company summary card.
- Full `/report` page rendering the company intelligence output with copyable keyword chips.
- Optional company context integrated into the optimize flow for company-tailored CV output.
- Company research state persisted in `sessionStorage` for navigation continuity between upload and report pages.

## Files Touched

### Frontend
| File / Group | Action | Notes |
|---|---|---|
| `src/app/page.tsx` | Modified | Upload form, submit flow, company research integration |
| `src/app/results/page.tsx` | Created | Score, keywords, comparison, gap analysis composition |
| `src/app/report/page.tsx` | Created | Full company intelligence report route |
| `src/context/OptimizationContext.tsx` | Created | Cross-page state (result + company research) + sessionStorage |
| `src/types/optimization.ts` | Created | Typed optimization response contracts |
| `src/types/company.ts` | Created | Company research and profile type contracts |
| `src/lib/api.ts` | Created | Typed API client (optimize + research) |
| `src/components/ui/FileUpload/*` | Created | PDF drag-and-drop upload with validation |
| `src/components/ui/JobDescription/*` | Created | Job description textarea |
| `src/components/ui/ScoreCard/*` | Created | ATS score visualization with thresholds |
| `src/components/ui/CvComparison/*` | Created | Original vs optimized section diff |
| `src/components/ui/GapAnalysis/*` | Created | Importance-sorted gap list |
| `src/components/ui/KeywordMatch/*` | Created | Matched/missing keyword chips and counts |
| `src/components/ui/CompanySearch/*` | Created | Research input form + `useCompanySearch` hook |
| `src/components/ui/ResearchProgress/*` | Created | Step-by-step research progress UI |
| `src/components/ui/CompanyCard/*` | Created | Compact research summary card |
| `src/components/ui/CompanyReport/*` | Created | Full report renderer |
| `src/components/ui/KeywordChips/*` | Created | Copyable keyword chip list |
| `src/test/*` | Created | Test setup, render helpers, mocks |
| `src/**/*.test.{ts,tsx}` | Created | Utility, component, hook, and context tests |

### Backend
| File / Group | Action | Notes |
|---|---|---|
| `app/main.py` | Created | FastAPI app, CORS, middleware registration, lifespan |
| `app/routers/optimize.py` | Created | Multipart optimize route; extended for optional company context |
| `app/routers/research.py` | Created | `POST /research-company` with concurrent I/O and timeout |
| `app/services/pdf_parser.py` | Created | PDF extraction and validation |
| `app/services/llm/base.py` | Created | LLM provider ABC and factory |
| `app/services/llm/anthropic.py` | Created | Anthropic concrete implementation with usage logging |
| `app/services/research/website_scraper.py` | Created | Scraper with SSRF protection and redirect hardening |
| `app/services/research/search_aggregator.py` | Created | Tavily + DuckDuckGo (`ddgs`) providers with capped results |
| `app/services/research/synthesizer.py` | Created | LLM synthesis from research sources |
| `app/core/prompts.py` | Created | Optimization + research + company-aware prompts |
| `app/core/config.py` | Created | Settings, rate-limit config, LLM pricing |
| `app/core/usage_logger.py` | Created | Structured usage logs with process-lifetime totals |
| `app/middleware/rate_limit.py` | Created | Async lock-protected in-memory IP limiter |
| `app/models/schemas.py` | Created | Pydantic request/response models for all endpoints |
| `backend/requirements.txt` | Modified | Added `ddgs`, `pytest-httpx`; replaced deprecated DDG package |
| `tests/` | Created | 62 passing tests across rate limiting, usage, research, and optimize |

## Decisions
- Context + `sessionStorage` for cross-page state: avoids URL bloat and survives soft navigation.
- Provider factory architecture: Anthropic first, interface ready for additional providers.
- Tavily primary + DuckDuckGo fallback: better quality with a key, still functional without one.
- `asyncio.gather` for scrape + search: reduces end-to-end research latency.
- In-memory rate limiting: zero extra infra for MVP; process-local is acceptable at this scale.
- Structured token/cost logging rather than DB persistence for initial observability.
- Vitest + React Testing Library: fast feedback loop and user-centric assertions.

## Still Open
- Rate limiting and usage totals are process-local (reset on restart; not shared across instances).
- `CORS_ORIGINS` must be in JSON array format in the backend env.
- No dedicated integration tests for the company research components yet.

## Validation
### Frontend
```bash
cd frontend && npx tsc --noEmit && npm run lint && npm run build && npm run test
```
- `tsc --noEmit`: pass
- `lint`: pass
- `build`: pass
- `test`: pass (50 tests)

### Backend
```bash
cd backend && python3 -m ruff check . && python3 -m ruff format --check . && python3 -m mypy app/ && python3 -m pytest
```
- `ruff check`: pass
- `ruff format --check`: pass
- `mypy app/`: pass
- `pytest`: pass (62 tests)
