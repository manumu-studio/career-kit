# ENTRY-2 — Form State Persistence, Auth Planning & Portfolio Review

**Date:** 2026-03-03
**Type:** Feature + Planning + Bug Fix + Review
**Branch:** `feature/company-intelligence`
**Version:** `0.2.x`

---

## What I Built

### Form State Persistence
- Extended `OptimizationContext` with a `FormState` slice (`companyName`, `companyUrl`, `jobTitle`, `jobDescription`, `fileName`) persisted to `sessionStorage` under `ats-form-state-v1`.
- Added `isFormState` runtime validator before hydration — same guard pattern used for existing stored values.
- Added `setFormState` (partial merge updater) and `clearFormState` to the context value.
- Updated `useCompanySearch` to hydrate its three inputs from context once after the provider finishes loading from storage, and to sync every change back to context.
- Updated the upload page to hydrate job description from context on mount and sync changes back; `handleFileChange` wrapped in `useCallback` to prevent an infinite re-render loop caused by `FileUpload`'s dependency-listed `onFileChange` prop.
- When a file was previously selected but the object is gone (navigation), shows a "Previously selected: `filename` — please re-select your file" hint.

### Auth Planning
- Planned full M2 Auth (OIDC) integration for Career Kit, following the exact pattern from the Learning Speaking App.
- Wrote 3 Cursor task specs (TASK-018, 019, 020) for auth implementation.
- Wrote PACKET-03 build packet documenting the auth integration scope, architecture, pre-requisites, and acceptance criteria.
- Renumbered build packets (shifted down by one) to accommodate PACKET-03 as the next logical step after company intelligence.

## Files Touched

| File | Action | Notes |
|---|---|---|
| `frontend/src/context/OptimizationContext.tsx` | Modified | Added `FormState`, `isFormState`, `setFormState`, `clearFormState`, sessionStorage persistence |
| `frontend/src/components/ui/CompanySearch/useCompanySearch.ts` | Modified | Context hydration on mount + sync on change for all three inputs |
| `frontend/src/app/page.tsx` | Modified | Job description hydration, `handleFileChange` memoized, file-name hint |
| `frontend/src/components/ui/ResearchProgress/ResearchProgress.tsx` | Modified | Fixed `getStepStatus` to return `"done"` instead of `"active"` for the final step |
| `docs/cursor-tasks/TASK-018-auth-infrastructure.md` | Created | Auth infrastructure spec |
| `docs/cursor-tasks/TASK-019-route-reorganization.md` | Created | Route groups spec |
| `docs/cursor-tasks/TASK-020-userbar-auth-pages.md` | Created | UserBar + auth error page spec |
| `docs/build-packets/PACKET-03-auth-m2-integration.md` | Created | Auth integration build packet |

## Decisions

### Form State
- Hydration guard via `useRef` rather than `useState` flag: avoids an extra render and keeps the effect lean.
- File object not persisted (not serializable) — only the name is stored so the UI can show a re-select prompt.
- `clearFormState` exposed on context for explicit resets; wiring to a "Start New Analysis" UI action is deferred to the next UX pass.

### Auth
- **Frontend-only auth gate** — no database, no backend JWT validation. Keeps scope minimal. DB deferred to when history persistence requires it.
- **M2 Auth as single OIDC provider** — instead of configuring Google/GitHub directly, Career Kit delegates to M2 Auth which already handles social logins. Simpler integration, strengthens the ecosystem narrative (3 consuming apps).
- **Route groups `(public)`/`(app)`** — same pattern as LSA. Auth checked server-side in `(app)/layout.tsx`, not middleware.
- **Upload page moves to `/home`** — because `(public)/page.tsx` and `(app)/page.tsx` would both resolve to `/`, causing a conflict. Landing page owns `/`, upload page lives at `/home`.
- **`env.server.ts` separate from `env.ts`** — existing `env.ts` is imported in client-side code (`api.ts`). Auth secrets must stay server-only. Split into two files for explicit safety.

## Bugs Fixed

**1. `Maximum update depth exceeded` on mount.**
`FileUpload.tsx` lists `onFileChange` as a `useEffect` dependency. The plain arrow `handleFileChange` in `page.tsx` received a new reference on every render, causing `setFile` → re-render → new reference → effect re-fires → loop. Wrapping in `useCallback([setFormState])` (stable dep) breaks the cycle.

**2. ResearchProgress spinner bug.**
The "Research complete" step was rendering a loading spinner instead of a checkmark because `getStepStatus("done", "done")` returned `"active"` instead of `"done"`.

## Rationale (Auth)

Auth is a **pre-deployment requirement** — without it, anyone can hit the app and burn LLM budget. Not urgent for local development, but blocks production deployment. Writing task specs now means Cursor can execute them whenever the user is ready, at zero Opus cost.

## Still Open

- `clearFormState` has no UI trigger yet; will be wired to a "Start New Analysis" button in the next UX pass.
- [ ] Update `PORTFOLIO_AUDIT_2026.md` with AWS and business corrections
- [ ] Update `CV_ENHANCED_2026.md` to reflect corrected positioning

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```
- `tsc --noEmit`: pass
- `lint`: pass
- `build`: pass

---

## Portfolio Review

Reviewed `PORTFOLIO_AUDIT_2026.md` and identified positioning gaps before using it for CV updates.

### Audit Corrections Needed
| Issue | Was | Should Be |
|---|---|---|
| Petsgram deployment | "Netlify + Render" | AWS (EC2 + S3 + CloudFront) |
| ManuMu Studio framing | "Portfolio project namespace" | Freelance business delivering client work |
| OR Studio context | "Real client project" | Client delivery through freelance business |
| Cross-project patterns | No infra section | AWS infrastructure management included |

### Seniority Assessment — Strong mid-level, senior-adjacent
**Senior-level signals already present:** OAuth 2.0/OIDC from scratch (PKCE, RS256, federated sign-out), multi-service ecosystem, AI pipeline architecture, AWS infrastructure (self-managed), security awareness (SSRF, CSP, rate limiting), freelance business with client delivery, bilingual strict typing (TS + mypy).

**Remaining gaps:** No team impact signal, no scale signal, no IaC/DevOps depth, all projects are solo.

**Bottom line:** Technical ceiling is senior. Gap is verifiable scope of experience, not skill.
