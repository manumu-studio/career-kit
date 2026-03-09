# PR-0.7.0 — Cover Letter Generation + PDF Export

**Branch:** `feature/cover-letter-pdf-export` → `main`
**Version:** `0.7.0`
**Date:** 2026-03-09
**Status:** ✅ Ready to merge
---
## Summary

Adds AI-generated cover letters tailored to the candidate's CV, job description, and company context. Users can optionally generate a cover letter on the results page (company name, hiring manager, tone) and export both the optimized CV and cover letter as downloadable PDFs. Backend exposes `POST /cover-letter`; all LLM providers implement `generate_cover_letter()`.

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `backend/app/core/prompts.py` | Modified | Cover letter prompts |
| `backend/app/services/llm/base.py` | Modified | generate_cover_letter abstract |
| `backend/app/services/llm/anthropic.py` | Modified | generate_cover_letter |
| `backend/app/services/llm/openai.py` | Modified | generate_cover_letter |
| `backend/app/services/llm/gemini.py` | Modified | generate_cover_letter |
| `backend/app/models/schemas.py` | Modified | CoverLetterRequest, CoverLetterResult |
| `backend/app/routers/cover_letter.py` | Created | POST /cover-letter |
| `backend/app/main.py` | Modified | Cover letter router |
| `backend/tests/test_cover_letter.py` | Created | Endpoint tests |
| `backend/tests/test_optimize.py` | Modified | Mock generate_cover_letter |
| `backend/tests/test_rate_limit.py` | Modified | Mock generate_cover_letter |
| `backend/tests/test_research_endpoint.py` | Modified | Mock generate_cover_letter |
| `backend/tests/test_synthesizer.py` | Modified | Mock generate_cover_letter |
| `frontend/src/types/cover-letter.ts` | Created | Cover letter types |
| `frontend/src/lib/api.ts` | Modified | generateCoverLetter |
| `frontend/src/context/OptimizationContext.tsx` | Modified | coverLetter state |
| `frontend/src/components/ui/CompanyInfo/` | Created | 4-file pattern |
| `frontend/src/components/ui/ToneSelector/` | Created | 4-file pattern |
| `frontend/src/components/ui/CoverLetterDisplay/` | Created | 4-file pattern |
| `frontend/src/components/ui/CvPdfDocument/` | Created | 4-file pattern |
| `frontend/src/components/ui/CoverLetterPdfDocument/` | Created | 4-file pattern |
| `frontend/src/components/ui/ExportToolbar/` | Created | 4-file pattern |
| `frontend/src/app/(app)/results/page.tsx` | Modified | Form, display, ExportToolbar |
| `frontend/package.json` | Modified | @react-pdf/renderer |

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Cover letter form on results page | User lands there after optimization; cv_text from sections |
| generate_cover_letter on all providers | ABC requires it; works with any provider |
| sessionStorage for coverLetter | Persists across refresh |
| @react-pdf/renderer | Client-side PDF; no backend dependency |
| cv_text from section originals | Reconstructs original CV for context |

## Testing Checklist

- [x] POST /cover-letter returns valid CoverLetterResult
- [x] Cover letter form submits with correct payload
- [x] Cover letter displays with greeting, paragraphs, sign-off, selling points
- [x] Download CV (PDF) works
- [x] Download Cover Letter (PDF) works (disabled when no letter)
- [x] Backend validation passes (ruff, mypy, pytest)
- [x] Frontend validation passes (tsc, build, lint)

## Deployment Notes

- No new env vars required. Cover letter uses existing LLM provider config.
- `@react-pdf/renderer` adds ~46 kB to results page bundle.

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
```
- tsc, build, lint: pass

```bash
cd backend && ruff check . && ruff format --check . && mypy app/ && pytest
```
- ruff, mypy, pytest: 68 passed
