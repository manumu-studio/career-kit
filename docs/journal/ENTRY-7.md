# ENTRY-7 — Cover Letter Generation + PDF Export

**Date:** 2026-03-09
**Type:** Feature
**Branch:** `feature/cover-letter-pdf-export`
**Version:** `0.7.0`
---
## What I Did

Added AI-generated cover letters tailored to the candidate's CV, job description, and company context. Users can optionally generate a cover letter on the results page by entering company name, optional hiring manager, and selecting a tone (professional, conversational, enthusiastic). The backend exposes `POST /cover-letter`; all three LLM providers (Anthropic, OpenAI, Gemini) implement `generate_cover_letter()`. The frontend includes CompanyInfo and ToneSelector components, CoverLetterDisplay with key selling points, and PDF export via `@react-pdf/renderer` for both the optimized CV and cover letter.

## Files Touched

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
| `backend/tests/test_*.py` | Modified | Mock generate_cover_letter |
| `frontend/src/types/cover-letter.ts` | Created | Cover letter types |
| `frontend/src/lib/api.ts` | Modified | generateCoverLetter |
| `frontend/src/context/OptimizationContext.tsx` | Modified | coverLetter state |
| `frontend/src/components/ui/CompanyInfo/` | Created | Company + hiring manager inputs |
| `frontend/src/components/ui/ToneSelector/` | Created | Tone radio selector |
| `frontend/src/components/ui/CoverLetterDisplay/` | Created | Formatted letter + selling points |
| `frontend/src/components/ui/CvPdfDocument/` | Created | ATS-friendly CV PDF |
| `frontend/src/components/ui/CoverLetterPdfDocument/` | Created | Letter-format PDF |
| `frontend/src/components/ui/ExportToolbar/` | Created | Download CV / Cover Letter buttons |
| `frontend/src/app/(app)/results/page.tsx` | Modified | Form, display, ExportToolbar |
| `frontend/package.json` | Modified | @react-pdf/renderer |

## Decisions (rationale bullets)

- **Cover letter form on results page:** User lands there after optimization; cv_text is derived from section originals.
- **generate_cover_letter on all providers:** ABC requires it; cover letter works with any selected provider.
- **sessionStorage for coverLetter:** Persists across refresh; cleared when user clears result.
- **@react-pdf/renderer:** Client-side PDF generation; no backend changes needed.
- **cv_text from sections:** Reconstructs original CV text for cover letter context.

## Still Open (known gaps)

- None. All planned work is complete.

## Validation (commands + results)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
```
- tsc, build, lint: pass

```bash
cd backend && ruff check . && ruff format --check . && mypy app/ && pytest
```
- ruff, mypy, pytest: 68 passed
