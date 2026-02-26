# ATS Career Kit

AI-powered CV optimizer that tailors resumes to pass ATS (Applicant Tracking System) filters.

Upload your CV (PDF) + paste a job description → get an ATS-optimized CV, gap analysis, keyword scoring, and match score.

## Stack

- **Frontend:** Next.js 15 (App Router) · TypeScript · Tailwind v4
- **Backend:** Python · FastAPI · Pydantic
- **AI:** Anthropic Claude (multi-provider planned)
- **PDF Parsing:** pdfplumber

## Getting Started

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # add your ANTHROPIC_API_KEY
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Roadmap

- [x] v0.1 — Foundation flow (upload → parse → optimize → results) + rate limiting + usage logging + test suite
- [ ] v0.2 — Company intelligence (research + profile synthesis + optimize integration)
- [ ] v0.3 — Cover letter generation + PDF export
- [ ] v0.4 — UX polish + validation + accessibility
- [ ] v0.7 — Multi-provider LLM support (Claude / OpenAI / Gemini)
