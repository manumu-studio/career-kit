# ATS Career Kit — Roadmap

**Purpose:** Track feature delivery status and next branch execution order.
**Last Updated:** 2026-03-05

---

## Current Release State

- Current working version: `0.3.0`
- Current feature branch: `feature/auth-m2-integration`
- Next planned branch: `feature/cover-letter-pdf-export`

---

## Feature Progress

| Version | Branch | Scope | Status |
|---|---|---|---|
| `0.1.0` | `feature/foundation` | Core upload + optimize + results flow, rate limiting, usage logging, test infrastructure | ✅ Complete |
| `0.2.0` | `feature/company-intelligence` | Company research pipeline, report page, optimize integration, form state persistence | ✅ Complete |
| `0.3.0` | `feature/auth-m2-integration` | M2 Auth OIDC, NextAuth v5, route protection, UserBar, federated sign-out | ✅ Complete |
| `0.4.0` | `feature/cover-letter-pdf-export` | Cover letter generation + PDF export | ⏳ Not started |
| `0.5.0` | `feature/ux-polish-error-handling` | UX polish, loading/error states, responsive/accessibility pass | ⏳ Not started |
| `0.6.0` | `feature/history-persistence` | Analysis history and persistence | ⏳ Not started |
| `0.7.0` | `feature/multi-provider-llm` | Multi-provider LLM support | ⏳ Not started |
| `0.8.0` | `feature/testing-suite` | Testing expansion (frontend, backend, e2e, coverage) | ⏳ Not started |
| `0.9.0 → 1.0.0` | `feature/deployment-ci-cd` | Deployment, CI/CD, release hardening | ⏳ Not started |

---

## Completed in 0.1.0

- Frontend scaffold: strict TypeScript, env validation, Tailwind v4, App Router.
- Backend scaffold: FastAPI, Pydantic settings, typed optimize endpoint.
- PDF parsing service with validation.
- Anthropic LLM provider + factory architecture.
- Upload page and results page with score card, keyword analysis, gap analysis, and CV comparison.
- IP-based in-memory rate limiting on `POST /optimize`.
- Structured LLM token usage and cost logging.
- Frontend test suite (Vitest + RTL) and backend test coverage (23 tests).

## Completed in 0.2.0

- Backend research pipeline: website scraper (SSRF-hardened), search aggregator (Tavily + DuckDuckGo), LLM synthesizer.
- `POST /research-company` with concurrent I/O and 45 s timeout.
- Company research UI: input form, step-by-step progress, summary card, full report page.
- Optimize endpoint extended with optional company context for tailored output.
- Company research and form inputs (company name, URL, job title, job description, file name) persisted to `sessionStorage`.
- 39 new backend tests — suite total 62 passing.

## Completed in 0.3.0

- NextAuth v5 with M2 Auth (OIDC) provider.
- Route groups `(public)` and `(app)` with server-side auth gate.
- Landing page at `/`, upload at `/home`, results and report under `(app)`.
- UserBar component, auth error page, federated sign-out.
- Signup redirect route for "Create one here" link.

---

## Next Execution Order

1. Merge `feature/auth-m2-integration` → `main` (PR-0.3.0 ready).
2. Start `feature/cover-letter-pdf-export`.
