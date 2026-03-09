# ENTRY-5 — Backend Deployment & Production Auth Fix

**Date:** 2026-03-06
**Type:** Infrastructure
**Branch:** `feature/backend-deployment`
**Version:** `0.5.0`
---
## What I Did

Deployed the FastAPI backend to AWS EC2 so the Vercel frontend can call a real production API. The backend runs as a systemd service behind Nginx with HTTPS via Let's Encrypt at `https://api.manumustudio.com`. Added GitHub Actions CI (ruff, mypy, pytest) and CD (deploy to EC2 via SSM). Fixed a production auth error where the auth barrel was pulling server env validation into the client bundle, causing "AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, NEXTAUTH_SECRET required" on Vercel.

## Files Touched

| File | Action | Notes |
|------|--------|-------|
| `backend/app/routers/health.py` | Created | Health check with DB status |
| `backend/app/main.py` | Modified | Health router, CORS on errors |
| `backend/app/core/config.py` | Modified | app_version 0.5.0, CORS parsing |
| `backend/scripts/setup-ec2.sh` | Created | EC2 setup, systemd, Nginx, certbot |
| `.github/workflows/backend-ci.yml` | Created | CI workflow |
| `.github/workflows/backend-deploy.yml` | Created | CD workflow |
| `frontend/src/features/auth/index.ts` | Modified | Client-safe barrel only |

## Decisions (rationale bullets)

- **Health endpoint:** `/health` for load balancers and CD verification. Returns DB status and version.
- **CORS on exception handler:** 500/422 responses need CORS headers or the browser blocks them.
- **Auth barrel client-safe:** Re-exporting auth from the barrel caused env.server.ts to load in the client bundle. Server vars are not available there, so the production check failed. Removed auth re-export; server code imports from auth.ts directly.
- **CD via SSM:** Uses AWS OIDC and SSM send-command for deploy. Alternative: SSH action if SSM not configured.

## Still Open (known gaps)

- CD requires AWS secrets (EC2_INSTANCE_ID, EC2_HOST, AWS_ROLE_ARN, AWS_REGION). Manual deploy works if SSM is not set up.
- Vercel env vars must be set for production auth.

## Validation (commands + results)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
```
- tsc, build, lint: pass

```bash
cd backend && python3 -m ruff check . && python3 -m ruff format --check . && python3 -m mypy app/ && python3 -m pytest
```
- ruff, mypy, pytest: 62 passed
