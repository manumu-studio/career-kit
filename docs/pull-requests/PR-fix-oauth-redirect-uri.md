# PR — OAuth Redirect URI Fix

**Branch:** `fix/oauth-redirect-uri` → `main`
**Date:** 2026-03-10
**Status:** ✅ Ready to merge
---
## Summary

Fixes production OAuth where the redirect URI was incorrectly set to localhost instead of the deployed domain. Adds `trustHost: true` to NextAuth so it reads the host from Vercel's forwarded headers. Removes an audit doc that was committed by mistake.

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `frontend/src/features/auth/auth.ts` | Modified | Added `trustHost: true` |
| `docs/SENIOR_READINESS_AUDIT_2026.md` | Deleted | Removed from repo |

## Architecture Decisions

| Decision | Why |
|----------|-----|
| trustHost: true | NextAuth v5 needs this to use X-Forwarded-Host from Vercel; otherwise falls back to localhost |
| Single config | trustHost covers all hosts (production, staging, localhost) automatically |

## Testing Checklist

- [x] TypeScript typecheck passes
- [x] Frontend build passes
- [x] Lint passes
- [x] Pre-push CI passed

## Deployment Notes

- Redeploy to Vercel after merge. No env var changes needed.
- Ensure M2 client has production redirect URI `https://careerkit.manumustudio.com/api/auth/callback/manumustudio` in its `redirectUris` array.

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
```
- tsc, build, lint: pass
