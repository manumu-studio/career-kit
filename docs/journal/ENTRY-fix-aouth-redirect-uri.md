# ENTRY-13 — OAuth Redirect URI Fix

**Date:** 2026-03-10
**Type:** Fix
**Branch:** `fix/oauth-redirect-uri`
**Version:** patch
---
## What I Did

Fixed production OAuth redirects where the "Get Started" button was sending `redirect_uri=http://localhost:3000/...` to M2 Auth instead of the actual domain. NextAuth v5 was not detecting the real host from Vercel's forwarded headers. Added `trustHost: true` to the NextAuth config so it trusts `X-Forwarded-Host` and builds the correct redirect URI (e.g. `https://careerkit.manumustudio.com/api/auth/callback/manumustudio`). Also removed an audit doc that had been committed by mistake.

## Files Touched

| File | Action | Notes |
|------|--------|-------|
| `frontend/src/features/auth/auth.ts` | Modified | Added `trustHost: true` to NextAuth config |
| `docs/SENIOR_READINESS_AUDIT_2026.md` | Deleted | Removed from repo |

## Decisions (rationale bullets)

- **trustHost: true:** NextAuth v5 beta.30 needs this to read the host from Vercel's `Host` / `X-Forwarded-Host` headers. Without it, it falls back to localhost.
- **trustHost covers all hosts:** Works for careerkit.manumustudio.com, lsa.manumustudio.com, and localhost — no per-domain config needed.

## Still Open (known gaps)

- Verify that client `b7e2c501-...` in the M2 database has the production redirect URI in its `redirectUris` array. If it only has localhost, M2 will reject the callback even with the correct URL detection.

## Validation (commands + results)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
```
- tsc, build, lint: pass
