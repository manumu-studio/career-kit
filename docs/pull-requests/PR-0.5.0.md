# PR-0.5.0 — Backend Deployment & Production Auth Fix

**Branch:** `feature/backend-deployment` → `main`
**Version:** `0.5.0`
**Date:** 2026-03-06
**Status:** ✅ Ready to merge
---
## Summary

Deploys the FastAPI backend to AWS EC2 at `https://api.manumustudio.com`. Adds health check endpoint, GitHub Actions CI/CD, and Nginx/systemd setup. Fixes production auth error by making the auth barrel client-safe so server env validation does not run in the browser.

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `backend/app/routers/health.py` | Created | Health check with DB status |
| `backend/app/main.py` | Modified | Health router, CORS on exception handler |
| `backend/app/core/config.py` | Modified | app_version 0.5.0, CORS_ORIGINS parsing |
| `backend/scripts/setup-ec2.sh` | Created | EC2 setup, systemd, Nginx, certbot |
| `.github/workflows/backend-ci.yml` | Created | CI: ruff, mypy, pytest |
| `.github/workflows/backend-deploy.yml` | Created | CD: SSM deploy, health check |
| `frontend/src/features/auth/index.ts` | Modified | Client-safe barrel; removed auth re-export |

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Health endpoint at `/health` | Standard for load balancers and CD verification |
| CORS headers in exception handler | 500/422 responses must include CORS or browser blocks them |
| Auth barrel client-safe only | Re-exporting auth pulled env.server.ts into client; server vars unavailable there caused production error |
| CD triggers on Backend CI success | Only passing builds deploy |

## Testing Checklist

- [x] Health endpoint returns 200 with DB status
- [x] Backend CI passes (ruff, mypy, pytest)
- [x] Frontend build and lint pass
- [x] Auth barrel fix verified (no env.server in client bundle)
- [x] Production auth works after fix

## Deployment Notes

- Backend runs on EC2 with systemd, Nginx, and certbot. Run `backend/scripts/setup-ec2.sh` for initial setup.
- CD requires GitHub secrets: `EC2_INSTANCE_ID`, `EC2_HOST`, `AWS_ROLE_ARN`, `AWS_REGION`.
- Vercel env vars for auth: `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `APP_URL`, `NEXT_PUBLIC_API_URL`.

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
```
- tsc, build, lint: pass

```bash
cd backend && python3 -m ruff check . && python3 -m ruff format --check . && python3 -m mypy app/ && python3 -m pytest
```
- ruff, mypy, pytest: 62 passed
