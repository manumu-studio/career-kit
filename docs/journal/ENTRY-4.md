# ENTRY-4 — Analysis History & Result Caching

**Date:** 2026-03-06
**Type:** Feature
**Branch:** `feature/analysis-history`
**Version:** `0.4.0`

---

## What I Did

- Added PostgreSQL persistence for company research and CV optimization results.
- Implemented cache logic: same company URL or same job description + company returns stored result without calling the LLM.
- Built History API: list (paginated, filterable), detail, delete, stats, and cache-check endpoints.
- Added History page with search, filters (All / Research / Optimization), and detail view.
- Added cache hit banners on the upload page: "We already researched [Company]" and "You optimized for this exact job description."
- Added comparison view to compare two optimization results side by side.
- Ensured graceful behavior when the database is unreachable: history endpoints return empty data instead of 500.
- Added Neon serverless PostgreSQL support by normalizing SSL params (sslmode → ssl) for the asyncpg driver.

---

## Files Touched

| File | Action | Notes |
|------|--------|-------|
| `backend/app/models/database.py` | Created | AnalysisHistory model, async engine, get_db_optional |
| `backend/app/routers/history.py` | Created | History CRUD, stats, cache check endpoints |
| `backend/app/services/cache/` | Created | CacheService, hash utils |
| `backend/alembic/` | Created | Migrations for analysis_history table |
| `backend/app/routers/research.py` | Modified | Cache check/store integration |
| `backend/app/routers/optimize.py` | Modified | Cache check/store integration |
| `backend/app/main.py` | Modified | CORS on errors, history router |
| `frontend/src/app/(app)/history/` | Created | History list, detail, compare pages |
| `frontend/src/components/ui/HistoryList/` | Created | List with pagination and filters |
| `frontend/src/components/ui/HistoryCard/` | Created | Analysis card component |
| `frontend/src/components/ui/CacheHitBanner/` | Created | Cache hit prompt |
| `frontend/src/components/ui/ComparisonView/` | Created | Side-by-side comparison |
| `frontend/src/lib/api.ts` | Modified | History API helpers |

---

## Decisions (rationale bullets)

- **Eager connection test in get_db_optional** — SQLAlchemy sessions connect lazily. Testing with `SELECT 1` before yielding ensures we know the DB is reachable; otherwise we yield None and endpoints return empty data.
- **URL normalization for Neon** — Neon connection strings use `sslmode=require` (psycopg2 style). asyncpg expects `ssl=require`. A helper strips incompatible params and adds `ssl=require` so Neon URLs work out of the box.
- **CORS headers on error responses** — When the backend returns 500, CORS middleware may not add headers. Explicit CORS on the global exception handler ensures the frontend receives error bodies instead of a CORS block.

---

## Still Open (known gaps)

- No dedicated frontend tests for history components.
- Rate limiting remains process-local.

---

## Validation (commands + results)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
# tsc, build, lint: all pass

cd backend && ruff check . && ruff format --check . && mypy app/ && pytest
# ruff, mypy, pytest (62 tests): all pass
```
