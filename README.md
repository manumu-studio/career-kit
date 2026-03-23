# Career Kit

AI-powered CV optimizer that tailors resumes for job applications.

Upload your CV (PDF) + paste a job description → get a job-tailored CV, cover letter, gap analysis, keyword scoring, and match score. Export both as PDFs.

## Stack

- **Frontend:** Next.js 15 (App Router) · TypeScript · Tailwind v4
- **Backend:** Python · FastAPI · Pydantic
- **AI:** Anthropic Claude, OpenAI GPT-4o, Google Gemini (multi-provider)
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
# Add auth vars for M2 Auth: AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, NEXTAUTH_SECRET, APP_URL
npm run dev
```

## Production

- **Frontend:** https://careerkit.manumustudio.com (Vercel)
- **Backend API:** https://api.manumustudio.com (AWS EC2)

## Roadmap

- [x] v0.1 — Foundation flow (upload → parse → optimize → results) + rate limiting + usage logging + test suite
- [x] v0.2 — Company intelligence (research + profile synthesis + optimize integration)
- [x] v0.3 — Auth gate (M2 Auth OIDC, NextAuth v5, route protection)
- [x] v0.4 — Analysis history (PostgreSQL persistence, caching, History page)
- [x] v0.5 — Backend deployment (EC2, Nginx, HTTPS, GitHub Actions CI/CD)
- [x] v0.6 — Multi-provider LLM support (Claude / OpenAI / Gemini)
- [x] v0.7 — Cover letter generation + PDF export
- [x] v0.8 — Testing suite
- [x] v0.9 — UX polish + validation + accessibility
- [x] v0.10 — Internationalization (EN/ES support)
- [x] v0.11 — Design system foundation (semantic tokens, theme system)
- [x] v0.12 — Landing page redesign + CV language auto-detection
- [x] v0.13 — App pages polish (responsive layouts, accessibility)
- [x] v0.14 — Tailored optimization flow (company research integration)
- [x] v0.15 — Design system foundation (dual-theme architecture, UI primitives)
- [ ] v0.16 — Landing page UI/UX overhaul
- [ ] v0.17 — App pages UI/UX overhaul
- [ ] v1.0 — Full production release

## Database (optional)

For analysis history and caching, set `DATABASE_URL` in `backend/.env`. Supports PostgreSQL (local or Neon). Run `alembic upgrade head` to create tables.
