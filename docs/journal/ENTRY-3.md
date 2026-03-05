# ENTRY-3 — M2 Auth OIDC Integration

**Date:** 2026-03-05
**Type:** Feature
**Branch:** `feature/auth-m2-integration`
**Version:** `0.3.0`

---

## What I Did

### Authentication
- Integrated NextAuth v5 (beta) with a custom OAuth provider pointing to M2 Auth at `https://auth.manumustudio.com`.
- Configured JWT session strategy with 30-day TTL, stateless, no database sessions.
- Added federated sign-out: clears local cookies and terminates the M2 Auth session via redirect to the auth server logout endpoint.
- Created `env.server.ts` with Zod validation for auth secrets, keeping them server-only (separate from client-imported `env.ts`).
- Extended session types with `externalId` and `idToken` for future backend use.

### Route Protection
- Introduced route groups: `(public)` for the landing page, `(app)` for protected pages.
- Server-side auth gate in `(app)/layout.tsx` — redirects to `/` if no session.
- Landing page at `/` shows "Sign in with ManuMuStudio" or "Go to App" based on auth state.
- Moved upload page to `/home`, results to `/results`, report to `/report` (all under `(app)`).

### UI
- Built **UserBar** component (4-file pattern): top bar with user name/email and sign-out button.
- Auth error page at `/auth/error` with human-readable messages for NextAuth error codes (Configuration, AccessDenied, Verification, OAuthSignin, etc.).
- Signup redirect route at `/api/auth/signup` for "Create one here" link on the landing page.

---

## Files Touched

| File | Action | Notes |
|------|--------|-------|
| `frontend/package.json` | Modified | Added next-auth@^5.0.0-beta.30 |
| `frontend/src/lib/env.server.ts` | Created | Server-only auth env validation |
| `frontend/src/features/auth/*` | Created | auth.ts, auth.types.ts, useSession.ts, index.ts |
| `frontend/src/app/api/auth/[...nextauth]/route.ts` | Created | NextAuth API handler |
| `frontend/src/app/api/auth/federated-signout/route.ts` | Created | Federated logout |
| `frontend/src/app/api/auth/signup/route.ts` | Created | Signup redirect |
| `frontend/src/app/(public)/page.tsx` | Created | Landing page |
| `frontend/src/app/(public)/layout.tsx` | Created | Public layout |
| `frontend/src/app/(app)/layout.tsx` | Created | Protected layout with auth gate |
| `frontend/src/app/(app)/home/page.tsx` | Created | Upload page (from root) |
| `frontend/src/app/(app)/results/page.tsx` | Created | Results page (moved) |
| `frontend/src/app/(app)/report/page.tsx` | Created | Report page (moved) |
| `frontend/src/app/auth/error/page.tsx` | Created | Auth error page |
| `frontend/src/components/ui/UserBar/*` | Created | UserBar component |
| `frontend/src/app/layout.tsx` | Modified | Root layout |
| `frontend/src/app/page.tsx` | Deleted | Replaced by (public)/page.tsx |
| `frontend/src/app/report/page.tsx` | Deleted | Moved to (app) |
| `frontend/src/app/results/page.tsx` | Deleted | Moved to (app) |

---

## Decisions

- **Frontend-only auth gate** — No database, no backend JWT validation. Keeps scope minimal; DB deferred until history persistence requires it.
- **M2 Auth as single OIDC provider** — Career Kit delegates to ManuMu Studio's auth server instead of configuring Google/GitHub directly. Simpler integration and ecosystem consistency.
- **Route groups instead of middleware** — Auth checked server-side in the `(app)` layout. Avoids middleware complexity and keeps auth logic in one place.
- **Upload at `/home`** — Landing page owns `/`. Having both `(public)/page.tsx` and `(app)/page.tsx` resolve to `/` would conflict.
- **`env.server.ts` split** — Existing `env.ts` is imported in client code (`api.ts`). Auth secrets must never reach the client. Separate file enforces server-only usage.

---

## Still Open

- Backend JWT validation when user identity is needed for history or usage tracking.
- Optional: middleware-based auth if we need to protect API routes in the future.

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
