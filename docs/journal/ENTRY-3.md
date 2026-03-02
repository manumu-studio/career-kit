# ENTRY-3 — Company Intelligence (PACKET-02)
**Date:** 2026-03-02
**Type:** Feature
**Branch:** `feature/company-intelligence`
**Version:** `0.2.0`
---

## What I Did
- Implemented backend company intelligence services and endpoint for website scraping, public search aggregation, and LLM synthesis.
- Implemented frontend company research workflow on the upload page with progress visualization and mini company summary.
- Implemented full `/report` page rendering company intelligence output with copyable keyword chips.
- Integrated optional company context into `/optimize` flow to support company-tailored CV optimization.
- Added task reports for `TASK-013` and `TASK-014`.

## Files Touched
| File Group | Notes |
|---|---|
| `backend/app/services/research/*` | Added scraper, search aggregator, synthesizer |
| `backend/app/routers/research.py` | Added `POST /research-company` |
| `backend/app/routers/optimize.py` | Added optional company context form fields |
| `backend/app/core/prompts.py` | Added company research + company-aware optimization prompt logic |
| `backend/app/models/schemas.py` | Added company/search/website schemas |
| `frontend/src/components/ui/CompanySearch/*` | Added research form + hook |
| `frontend/src/components/ui/ResearchProgress/*` | Added step-by-step progress UI |
| `frontend/src/components/ui/CompanyCard/*` | Added compact research summary card |
| `frontend/src/components/ui/CompanyReport/*` | Added full report renderer |
| `frontend/src/components/ui/KeywordChips/*` | Added copyable keyword chips |
| `frontend/src/app/report/page.tsx` | Added report route |
| `frontend/src/context/OptimizationContext.tsx` | Added company research persistence |
| `frontend/src/lib/api.ts` | Added research API + optional optimize context |
| `frontend/src/app/page.tsx` | Integrated research -> optimize -> report navigation |

## Decisions
- Kept research flow resilient: endpoint degrades gracefully if one data source fails.
- Preserved optimize schema compatibility while adding optional company context.
- Stored company research in session storage to persist between upload and report pages.

## Still Open
- Optional enhancement: add dedicated unit/integration tests for `/research-company` and frontend research components.
- Optional enhancement: include `keywords_to_mirror` in backend optimize context payload directly.

## Validation
### Frontend
```bash
cd frontend
npx tsc --noEmit
npm run lint
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run build
```
- All pass.

### Backend
```bash
cd backend
python3 -m ruff check .
python3 -m ruff format --check .
python3 -m mypy app/
python3 -m pytest
```
- All pass (`23` tests).
