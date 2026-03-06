# PR-0.4.0 — Analysis History & Result Caching

**Branch:** `feature/analysis-history` → `main`
**Version:** `0.4.0`
**Date:** 2026-03-06
**Status:** ✅ Ready to merge

---

## Summary

- Persists every company research and CV optimization in PostgreSQL.
- Returns cached results when the same company URL or job description + company is submitted again.
- Adds History page with list, detail, and comparison views.
- Adds cache hit banners on the upload page when a match exists.
- Supports Neon serverless PostgreSQL via URL normalization.
- History endpoints degrade gracefully when the database is unreachable.

---

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `backend/app/models/database.py` | Created | AnalysisHistory, engine, get_db_optional, URL normalization |
| `backend/app/routers/history.py` | Created | History CRUD, stats, check-research, check-optimization |
| `backend/app/services/cache/` | Created | CacheService, hash_utils |
| `backend/alembic/` | Created | Migrations |
| `backend/app/routers/research.py` | Modified | Cache check/store |
| `backend/app/routers/optimize.py` | Modified | Cache check/store |
| `backend/app/models/schemas.py` | Modified | History schemas |
| `backend/app/core/config.py` | Modified | database_url |
| `backend/app/core/dependencies.py` | Created | get_user_id |
| `backend/app/main.py` | Modified | CORS on errors, history router |
| `frontend/src/app/(app)/history/` | Created | History pages |
| `frontend/src/components/ui/HistoryList/` | Created | List + useHistoryList |
| `frontend/src/components/ui/HistoryCard/` | Created | Card component |
| `frontend/src/components/ui/CacheHitBanner/` | Created | Cache hit banner |
| `frontend/src/components/ui/ComparisonView/` | Created | Comparison view |
| `frontend/src/app/(app)/home/page.tsx` | Modified | Optimization cache banner |
| `frontend/src/components/ui/CompanySearch/*` | Modified | Research cache banner |
| `frontend/src/components/ui/UserBar/UserBar.tsx` | Modified | History link |
| `frontend/src/lib/api.ts` | Modified | History API |
| `frontend/src/types/history.ts` | Created | History types |

---

## Architecture Decisions

| Decision | Why |
|----------|-----|
| get_db_optional with eager connection test | DB-down resilience; avoids generator cleanup errors |
| _normalize_asyncpg_url | Neon uses sslmode; asyncpg uses ssl. Normalize for compatibility. |
| CORS headers in exception handler | 500 responses need CORS so frontend can read error bodies |
| Separate research/optimization rows | Each type stored independently; filters map to analysis_type |

---

## Testing Checklist

- [x] Frontend typecheck, build, lint pass
- [x] Backend ruff, mypy, pytest (62 tests) pass
- [x] History list returns empty when DB down
- [x] Migrations run with Neon (postgresql+asyncpg URL)

---

## Deployment Notes

- Set `DATABASE_URL` in backend `.env` (e.g. Neon `postgresql+asyncpg://...`, or local PostgreSQL).
- Run `alembic upgrade head` to create tables.
- PostgreSQL must be running for research and optimization to persist; history endpoints work without DB (return empty).

---

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
# pass

cd backend && ruff check . && ruff format --check . && mypy app/ && pytest
# pass (62 tests)
```
