# PR-0.3.0 — M2 Auth OIDC Integration

**Branch:** `feature/auth-m2-integration` → `main`
**Version:** `0.3.0`
**Date:** 2026-03-05
**Status:** ✅ Ready to merge

---

## Summary

Gates Career Kit behind authentication using M2 Auth (OIDC). Users must sign in before accessing the upload, results, and report pages. NextAuth v5 with custom M2 Auth provider, JWT sessions, federated sign-out, route groups, UserBar, and auth error page. Frontend-only — no database, no backend JWT validation.

---

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `frontend/package.json` | Modified | Added next-auth@^5.0.0-beta.30 |
| `frontend/src/lib/env.server.ts` | Created | Server-only auth env validation |
| `frontend/src/features/auth/auth.ts` | Created | NextAuth config + M2 Auth provider |
| `frontend/src/features/auth/auth.types.ts` | Created | Session/JWT type augmentation |
| `frontend/src/features/auth/useSession.ts` | Created | Client session hook |
| `frontend/src/features/auth/index.ts` | Created | Barrel export |
| `frontend/src/app/api/auth/[...nextauth]/route.ts` | Created | NextAuth API handler |
| `frontend/src/app/api/auth/federated-signout/route.ts` | Created | Federated logout |
| `frontend/src/app/api/auth/signup/route.ts` | Created | Signup redirect |
| `frontend/src/app/(public)/page.tsx` | Created | Landing page |
| `frontend/src/app/(public)/layout.tsx` | Created | Public layout |
| `frontend/src/app/(app)/layout.tsx` | Created | Protected layout (auth gate) |
| `frontend/src/app/(app)/home/page.tsx` | Created | Upload page (moved) |
| `frontend/src/app/(app)/results/page.tsx` | Created | Results page (moved) |
| `frontend/src/app/(app)/report/page.tsx` | Created | Report page (moved) |
| `frontend/src/app/auth/error/page.tsx` | Created | Auth error page |
| `frontend/src/components/ui/UserBar/UserBar.tsx` | Created | User identity bar |
| `frontend/src/components/ui/UserBar/UserBar.types.ts` | Created | Props interface |
| `frontend/src/components/ui/UserBar/index.ts` | Created | Barrel export |
| `frontend/src/app/layout.tsx` | Modified | Root layout |
| `frontend/src/app/page.tsx` | Deleted | Replaced by (public)/page.tsx |
| `frontend/src/app/report/page.tsx` | Deleted | Moved to (app) |
| `frontend/src/app/results/page.tsx` | Deleted | Moved to (app) |

---

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Frontend-only auth gate | No database, no backend JWT validation. Minimal scope; DB deferred to history persistence. |
| M2 Auth as single OIDC provider | Delegates to ManuMu Studio auth server; simpler integration, ecosystem consistency. |
| Route groups `(public)` / `(app)` | Auth checked server-side in layout, not middleware. |
| Upload at `/home` | Landing owns `/`; avoids route conflict. |
| `env.server.ts` separate | Auth secrets stay server-only; `env.ts` is client-imported. |
| Federated sign-out | Clears local cookies and M2 Auth session for full logout. |

---

## Testing Checklist

- [x] Visiting `/` shows landing page with "Sign in with ManuMuStudio" button
- [x] Clicking sign-in redirects to M2 Auth consent screen
- [x] After login, user is redirected to `/home`
- [x] UserBar shows user name/email on protected pages
- [x] Sign Out clears session and redirects appropriately
- [x] Visiting `/home`, `/results`, `/report` without session redirects to `/`
- [x] Auth error page renders at `/auth/error` with meaningful messages
- [x] All existing functionality (upload, optimize, results, report) works unchanged
- [x] Frontend: tsc, build, lint pass
- [x] Backend: ruff, mypy, pytest pass (62 tests)

---

## Deployment Notes

- Register OAuth client in M2 Auth for Career Kit:
  - Redirect URI (dev): `http://localhost:3000/api/auth/callback/manumustudio`
  - Redirect URI (prod): `https://<production-domain>/api/auth/callback/manumustudio`
  - Post-logout redirect (dev): `http://localhost:3000`
  - Post-logout redirect (prod): `https://<production-domain>`
  - Scopes: `openid email profile`
- Set environment variables in `frontend/.env.local`:
  ```bash
  AUTH_CLIENT_ID=<client_id from M2 Auth>
  AUTH_CLIENT_SECRET=<client_secret from M2 Auth>
  NEXTAUTH_SECRET=<openssl rand -base64 32>
  APP_URL=http://localhost:3000
  ```
- For CI builds without real auth, use placeholders:
  ```bash
  AUTH_CLIENT_ID=placeholder AUTH_CLIENT_SECRET=placeholder NEXTAUTH_SECRET=12345678901234567890123456789012 npm run build
  ```

---

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
```
- tsc: pass
- build: pass
- lint: pass

```bash
cd backend && python3 -m ruff check . && python3 -m ruff format --check . && python3 -m mypy app/ && python3 -m pytest
```
- ruff check: pass
- ruff format: pass
- mypy: pass
- pytest: pass (62 tests)
