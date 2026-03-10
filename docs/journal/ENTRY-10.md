# ENTRY-10 — Internationalization (EN/ES)

**Date:** 2026-03-10
**Type:** Feature
**Branch:** `feature/i18n-en-es`
**Version:** `0.11.0`

---

## What I Did

Added full English/Spanish language support across the app. Installed next-intl and set up locale routing with `/en/` and `/es/` URL prefixes. Created translation files (`en.json`, `es.json`) with namespaced keys for common, home, results, history, cover letter, validation, toast, export, and other sections. Replaced hardcoded strings in all pages and components with `useTranslations` / `getTranslations` calls. Added a LanguageSwitcher in the header with cookie persistence. Backend now accepts a `language` parameter on optimize, cover-letter, research, and compare endpoints; API error messages and LLM outputs (optimized CV, cover letter, research synthesis) are generated in the user's language.

## Files Touched

| File | Action | Notes |
|------|--------|------|
| middleware.ts | Modified | next-intl locale detection, URL rewriting |
| i18n/request.ts, routing.ts, navigation.ts | Created | next-intl config |
| messages/en.json, es.json | Created | Translation files |
| app/layout.tsx, [locale]/layout.tsx | Modified | Locale provider, nested layout |
| app/not-found.tsx, [locale]/not-found.tsx | Created | 404 pages |
| LanguageSwitcher/ | Created | Toggle EN/ES, cookie persistence |
| UserBar, CompanySearch, ProviderSelector | Modified | Translations |
| HistoryList, HistoryCard | Modified | Translations |
| FileUpload, JobDescription, ProgressBar | Modified | Translations |
| ScoreCard, GapAnalysis, KeywordMatch | Modified | Translations |
| CvComparison, ExportToolbar | Modified | Translations |
| home, results, history, report, auth/error pages | Modified | Translations |
| api.ts | Modified | Pass language from locale to API calls |
| api-errors.ts | Modified | Export GENERIC_ERROR_EN for translation |
| backend/core/i18n.py | Created | Error message translations |
| backend/routers/*, services/llm/*, prompts.py | Modified | Language param, LLM prompts |

## Decisions (rationale bullets)

- next-intl for App Router compatibility and URL-based locale
- Cookie persistence so language choice survives sessions
- Backend language param instead of Accept-Language to keep API explicit
- LLM prompts instruct model to respond in the requested language

## Still Open (known gaps)

- Backend mypy: some `language` params typed as `str` where `Literal['en','es']` expected
- PDF export in Spanish: character support not explicitly verified

## Validation (commands + results)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
# ✓ All pass

cd backend && ruff check . && ruff format --check .
# ✓ All pass
# mypy reports 14 type errors (language param)
```
