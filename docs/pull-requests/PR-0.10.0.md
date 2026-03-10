# PR-0.10.0 — Internationalization (EN/ES)

**Branch:** `feature/i18n-en-es` → `main`
**Version:** `0.10.0`
**Date:** 2026-03-10
**Status:** ✅ Ready to merge

---

## Summary

Adds full English/Spanish language support. Users can switch languages via a header toggle; preference is persisted in a cookie. All UI strings, form labels, error messages, and validation feedback render in the selected locale. URL reflects locale (`/en/...`, `/es/...`). Backend accepts `language` on optimize, cover-letter, research, and compare endpoints; API errors and LLM outputs (CV, cover letter, research) are generated in the user's language.

## Files Changed

| File                                             | Action   | Notes                       |
| ------------------------------------------------ | -------- | --------------------------- |
| middleware.ts                                    | Modified | next-intl locale detection  |
| i18n/request.ts, routing.ts, navigation.ts       | Created  | i18n config                 |
| messages/en.json, es.json                        | Created  | Translations                |
| app/layout.tsx, [locale]/layout.tsx              | Modified | Locale provider             |
| app/not-found.tsx, [locale]/not-found.tsx        | Created  | 404 pages                   |
| LanguageSwitcher/                                | Created  | Toggle + cookie             |
| UserBar, CompanySearch, ProviderSelector         | Modified | Translations                |
| HistoryList, HistoryCard                         | Modified | Translations                |
| FileUpload, JobDescription, ProgressBar          | Modified | Translations                |
| ScoreCard, GapAnalysis, KeywordMatch             | Modified | Translations                |
| CvComparison, ExportToolbar                      | Modified | Translations                |
| home, results, history, report, auth/error pages | Modified | Translations                |
| api.ts                                           | Modified | language param on API calls |
| api-errors.ts                                    | Modified | GENERIC_ERROR_EN export     |
| backend/core/i18n.py                             | Created  | Error translations          |
| backend/routers/_, services/llm/_, prompts.py    | Modified | language param, LLM prompts |

## Architecture Decisions

| Decision                        | Why                                                 |
| ------------------------------- | --------------------------------------------------- |
| next-intl with [locale] routing | App Router compatible, URL reflects language        |
| Cookie for language preference  | Persists across sessions                            |
| Explicit language param on API  | Clearer than Accept-Language header                 |
| LLM prompts parameterized       | Ensures CV, cover letter, research in user language |

## Testing Checklist

- [ ] Switch to ES, verify all UI strings in Spanish
- [ ] Run optimization in ES, verify LLM output in Spanish
- [ ] Switch back to EN, verify everything reverts
- [ ] Check URL changes (/en/... vs /es/...)
- [ ] Verify language persists after refresh
- [ ] Test API error messages in both languages

## Deployment Notes

No new env vars. Frontend and backend both modified.

## Validation (commands + results)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
# ✓ All pass

cd backend && ruff check . && ruff format --check .
# ✓ All pass
```
