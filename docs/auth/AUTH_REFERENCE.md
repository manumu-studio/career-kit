# Auth Reference — M2 Auth + Career Kit

**Purpose:** Single source of truth for M2 Auth, OIDC flow, LSA reference, Career Kit differences, task order, and execution steps.

---

## 1. What M2 Auth Is and How OIDC Works

### M2 Auth (ManuMuStudio Auth)

**M2 Auth** is a self-hosted OIDC (OpenID Connect) provider at `https://auth.manumustudio.com/`. It acts as the central identity provider for ManuMu Studio apps (Learning Speaking App, Career Kit, etc.).

- **Issuer:** `https://auth.manumustudio.com/`
- **Endpoints:**
  - Authorize: `/oauth/authorize`
  - Token: `/oauth/token`
  - UserInfo: `/oauth/userinfo`
  - Logout: `/oauth/logout`
- **Scopes:** `openid email profile`

### OIDC Flow (Authorization Code + PKCE)

1. **Client creates code verifier + code challenge** — random secret and its hash.
2. **User clicks "Sign in"** → app redirects to M2 Auth `/oauth/authorize` with `scope`, `client_id`, `redirect_uri`, `code_challenge`, `state`.
3. **M2 Auth authenticates user** (login/signup) and obtains consent.
4. **M2 Auth redirects back** to app with `code` and `state` in the query string.
5. **App exchanges code + code_verifier** for tokens at `/oauth/token` → receives `id_token`, `access_token`.
6. **App fetches user claims** from `/oauth/userinfo` (or uses `id_token`).
7. **NextAuth stores session** in JWT cookie (`authjs.session-token`).

**PKCE** prevents authorization code interception: an attacker who steals the code cannot exchange it without the code verifier.

---

## 2. How LSA (Learning Speaking App) Integrated M2 Auth

### Reference Files

| File | Purpose |
|------|---------|
| `src/features/auth/auth.ts` | NextAuth config, OIDC provider, JWT/session callbacks |
| `src/features/auth/auth.types.ts` | Session/JWT type augmentation |
| `src/features/auth/useSession.ts` | Re-export of `useSession` from next-auth/react |
| `src/features/auth/syncUser.ts` | **DB sync** — find-or-create user in PostgreSQL after sign-in |
| `src/features/auth/index.ts` | Barrel export (includes `syncUser`) |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth catch-all handler |
| `src/app/api/auth/federated-signout/route.ts` | Clears cookies + redirects to M2 Auth logout |
| `src/app/(app)/layout.tsx` | Protected layout — calls `syncUser()`, then renders children |
| `src/components/ui/TopBar/TopBar.tsx` | Top bar with user name + sign-out button |

### LSA Auth Flow

1. User signs in via NextAuth → M2 Auth OIDC.
2. **Protected layout** runs `syncUser({ externalId, email, displayName })` → upserts user in local PostgreSQL.
3. All app routes are under `(app)` → layout checks session, syncs user, renders TopBar + children.
4. Sign-out → `GET /api/auth/federated-signout` → clears cookies, redirects to M2 Auth logout with `id_token_hint` → M2 Auth clears its session → redirects back to app.

### LSA Env

- Single `lib/env.ts` — validates `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, `NEXTAUTH_SECRET`, etc.
- Used by both auth config and other app code.

---

## 3. Career Kit vs LSA — Key Differences

| Aspect | LSA | Career Kit |
|--------|-----|------------|
| **Database** | PostgreSQL + Prisma — stores users via `syncUser()` | **No database** — PACKET-03 says auth is purely cookie-based |
| **syncUser** | Yes — called in protected layout after sign-in | **No** — not exported, not used |
| **Env files** | Single `env.ts` | **Split:** `env.ts` (client: `NEXT_PUBLIC_API_URL`) + `env.server.ts` (server: auth secrets) |
| **Theme** | (varies) | **Dark theme** — slate-950, sky-500 accent |
| **TopBar** | `TopBar` component | **UserBar** — same idea, different name |
| **Route groups** | `(public)` + `(app)` | Same — `(public)` landing, `(app)` protected |
| **Future DB** | N/A | When added later (e.g. analysis history), it will be **Career Kit’s own DB**, separate from LSA |

### Why No DB in Career Kit (Yet)

PACKET-03 specifies that Career Kit does not get a database in the current phase. Auth is cookie-based only. When you later add persistence (e.g. analysis history, saved CVs), that will use a **separate Career Kit database**, not LSA’s.

---

## 4. The 3 Tasks in Order

| Order | Task File | Title |
|-------|-----------|-------|
| **1** | `TASK-019-auth-infrastructure.md` | Auth Infrastructure — next-auth + M2 Auth OIDC Provider |
| **2** | `TASK-020-route-reorganization.md` | Route Reorganization — Public/Protected Groups + Auth Gate |
| **3** | `TASK-021-userbar-auth-pages.md` | UserBar Component + Auth Error Page |

**Note:** Task content sometimes says "TASK-018" for the auth infra task; the file is `TASK-019-auth-infrastructure.md`. TASK-020 in the file content refers to route reorganization; TASK-021 refers to UserBar.

**Dependencies:**
- TASK-019 → blocks TASK-020, TASK-021
- TASK-020 → blocks TASK-021 (UserBar is added to the layout created in TASK-020)

---

## 5. Full End-to-End Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Career Kit Auth Flow                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

  User                    Career Kit (Next.js)              M2 Auth
   │                              │                            │
   │  1. Visit /                  │                            │
   │  ──────────────────────────► │                            │
   │                              │  (public)/page.tsx         │
   │  2. Click "Sign in"          │                            │
   │  ──────────────────────────► │                            │
   │                              │  signIn('manumustudio')    │
   │                              │  redirectTo: '/home'       │
   │                              │                            │
   │  3. Redirect to M2 Auth      │                            │
   │  ◄──────────────────────────│───────────────────────────►│
   │                              │  /oauth/authorize           │
   │                              │  scope=openid email profile │
   │                              │  code_challenge (PKCE)      │
   │                              │  state                     │
   │  4. User logs in at M2 Auth  │                            │
   │  ───────────────────────────────────────────────────────►│
   │                              │                            │
   │  5. Redirect back with code  │                            │
   │  ◄──────────────────────────│◄───────────────────────────│
   │                              │  /api/auth/callback/...    │
   │                              │  code + state              │
   │                              │                            │
   │                              │  6. Exchange code for tokens
   │                              │  ─────────────────────────►│
   │                              │  /oauth/token              │
   │                              │  code + code_verifier      │
   │                              │                            │
   │                              │  7. Tokens + userinfo      │
   │                              │  ◄─────────────────────────│
   │                              │  id_token, access_token    │
   │                              │                            │
   │                              │  8. NextAuth creates JWT   │
   │                              │     session cookie         │
   │                              │                            │
   │  9. Redirect to /home        │                            │
   │  ◄──────────────────────────│                            │
   │                              │  (app)/layout.tsx          │
   │                              │  auth() → session exists   │
   │                              │  → render UserBar + pages  │
   │                              │  (NO syncUser — no DB)     │
   │                              │                            │
   │  ──── SIGN OUT ────          │                            │
   │                              │                            │
   │  10. Click "Sign Out"        │                            │
   │  ──────────────────────────► │                            │
   │                              │  GET /api/auth/federated-signout
   │                              │  → decode id_token from cookie
   │                              │  → clear auth cookies       │
   │                              │  → redirect to M2 Auth     │
   │  11. Redirect to M2 logout   │                            │
   │  ◄──────────────────────────│───────────────────────────►│
   │                              │  /oauth/logout             │
   │                              │  id_token_hint             │
   │                              │  post_logout_redirect_uri  │
   │                              │                            │
   │  12. M2 Auth clears session  │                            │
   │      → redirect to /         │                            │
   │  ◄──────────────────────────│◄───────────────────────────│
   │                              │                            │
```

---

## 6. "Don't Touch" Guardrails

### From `.cursorrules` (Hard Rules)

1. **Never install packages** not in the current build packet or task.
2. **Never modify files** outside the current scope.
3. **4-file component pattern** — no exceptions.
4. All API routes validate auth before DB ops.
5. No `console.log` in production code.
6. Env vars only via Zod-validated env from `lib/env.ts` (or `env.server.ts` for server).
7. HTTP errors: `{ error: string, code?: string }` with proper status codes.
8. Prisma queries always scoped to `userId` (when DB exists).
9. No default exports except Next.js framework requirements.
10. Use `@/` path alias for all imports.

### Cursor Task Protocol

- **Read the task completely** before writing code.
- **Follow every instruction** — task was written by the architect.
- **Stay in scope** — only modify files listed in the task.
- **Never modify** `.cursorrules`, `.claude/`, or `docs/` beyond task scope.
- **Create task report** at `docs/cursor-task-reports/TASK-NNN-report.md` after completion.

### Auth-Specific Guardrails (from tasks)

- **Do NOT add `syncUser`** — Career Kit has no database.
- **Do NOT import `env.server.ts` in client code** — server-only.
- **Do NOT modify `frontend/src/lib/env.ts`** — keep client env separate.
- **Use `serverEnv`** (not `env`) in `auth.ts` and `federated-signout/route.ts` to avoid collision with client `env.ts`.

---

## 7. Execution Order — Step by Step

### Prerequisites

1. **M2 Auth seed script** — Run in the M2 Auth project to create/obtain OAuth client credentials for Career Kit.
2. **Credentials** — You need `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, and `NEXTAUTH_SECRET`.

### Steps

| Step | Action |
|------|--------|
| 1 | Run the seed script in M2 Auth → get `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET` |
| 2 | Add credentials to `frontend/.env.local`: `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, `NEXTAUTH_SECRET` (min 32 chars), `APP_URL` (e.g. `http://localhost:3000`) |
| 3 | Give Cursor the prompt + run **TASK-019** (auth infrastructure) |
| 4 | Run **TASK-020** (route reorganization + protected layout) |
| 5 | Run **TASK-021** (UserBar + auth error page) |
| 6 | Come back for human review |

### Quality Gate (after each task)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
```

---

## 8. Environment Variables Summary

### `frontend/.env.local` (add for auth)

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_CLIENT_ID` | Yes | OAuth client ID from M2 Auth |
| `AUTH_CLIENT_SECRET` | Yes | OAuth client secret from M2 Auth |
| `NEXTAUTH_SECRET` | Yes | Min 32 chars — used to sign JWT session |
| `APP_URL` | No (default) | `http://localhost:3000` — used for redirects |
| `NEXT_PUBLIC_API_URL` | Yes (existing) | Backend API URL |

`AUTH_*` and `NEXTAUTH_SECRET` are validated in `env.server.ts` and never exposed to the client bundle.
