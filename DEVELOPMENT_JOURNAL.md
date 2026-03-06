# Development Journal

**Project:** ATS Career Kit
**Status:** Active Development

This journal tracks the development progress of ATS Career Kit, an AI-powered CV optimizer built with Next.js 15 and Python FastAPI.

---

## Current Focus

- Cover letter generation + PDF export (planned).

---

## Journal Entries

### [Entry 1 — Foundation, Hardening & Company Intelligence](docs/journal/ENTRY-1.md)
**Dates:** 2026-02-25 to 2026-03-02
**Type:** Feature
**Versions:** `0.1.0` to `0.2.0`

End-to-end ATS optimization flow: PDF upload, LLM processing, structured results. Company intelligence pipeline with website scraping, search aggregation, and LLM synthesis. Rate limiting, token cost logging, and full test suites for frontend and backend.

---

### [Entry 2 — Form State Persistence, Auth Planning & Portfolio Review](docs/journal/ENTRY-2.md)
**Date:** 2026-03-03
**Type:** Feature + Planning
**Version:** `0.2.x`

Form state persistence across navigation via context + sessionStorage. Auth integration planning with M2 Auth (OIDC). Bug fixes for render loops and UI state inconsistencies.

---

### [Entry 3 — M2 Auth OIDC Integration](docs/journal/ENTRY-3.md)
**Date:** 2026-03-05
**Type:** Feature
**Version:** `0.3.0`

Frontend-only auth gate with NextAuth v5 and M2 Auth (OIDC). Route groups `(public)`/`(app)`, UserBar, auth error page, federated sign-out. Upload moved to `/home`, landing at `/`.

---

### [Entry 4 — Analysis History & Result Caching](docs/journal/ENTRY-4.md)
**Date:** 2026-03-06
**Type:** Feature
**Version:** `0.4.0`

PostgreSQL persistence for research and optimization. Cache check before LLM calls. History page with list, detail, comparison. Cache hit banners on upload page. Neon serverless support.

---

## Pull Requests

### [PR-0.1.0 — Foundation End-to-End Flow](docs/pull-requests/PR-0.1.0.md)
Upload, optimization pipeline, and results UI.

### [PR-0.2.0 — Company Intelligence & Form State Persistence](docs/pull-requests/PR-0.2.0.md)
Company research pipeline, report page, form state persistence, and auth planning.

### [PR-0.3.0 — M2 Auth OIDC Integration](docs/pull-requests/PR-0.3.0.md)
Auth gate with NextAuth v5 and M2 Auth. Route groups, UserBar, federated sign-out.

### [PR-0.4.0 — Analysis History & Result Caching](docs/pull-requests/PR-0.4.0.md)
PostgreSQL persistence, cache logic, History page, cache hit banners, Neon support.

---

## Project Status

**Current Version:** 0.4.0
**Last Updated:** 2026-03-06

### Completed Features

- End-to-end ATS optimization flow
- Company intelligence pipeline (scrape + search + LLM synthesis)
- Form state persistence across navigation
- M2 Auth (OIDC) integration — frontend-only auth gate
- Analysis history persistence (PostgreSQL, Neon)
- Result caching (research 14d, optimization 30d TTL)
- History page with list, detail, comparison views
- Cache hit banners on upload page
- Rate limiting on optimize endpoint
- Token cost logging
- Frontend and backend test suites

### Planned Features

- Cover letter and PDF export
- UX polish and error handling
- Multi-provider LLM support
- CI/CD and deployment

---

**Last Updated:** 2026-03-06
