# PR-0.6.0 — Multi-Provider LLM Support

**Branch:** `feature/multi-provider-llm` → `main`
**Version:** `0.6.0`
**Date:** 2026-03-09
**Status:** ✅ Ready to merge
---
## Summary

Adds multi-provider LLM support so users can choose between Anthropic Claude, OpenAI GPT-4o, and Google Gemini for CV optimization. A provider factory resolves the active provider from config or request; providers are only available when their API keys are set. New endpoints expose available providers and support side-by-side comparison. The frontend includes a provider selector on the home page (persisted in localStorage), a provider badge on results, and a dedicated compare page.

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `backend/app/services/llm/openai.py` | Created | OpenAIProvider (GPT-4o) |
| `backend/app/services/llm/gemini.py` | Created | GeminiProvider (Gemini 2.0 Flash) |
| `backend/app/services/llm/factory.py` | Modified | PROVIDERS, get_available_providers |
| `backend/app/services/llm/base.py` | Modified | model_name property |
| `backend/app/services/llm/anthropic.py` | Modified | model_name |
| `backend/app/routers/providers.py` | Created | GET /providers, POST /compare |
| `backend/app/routers/optimize.py` | Modified | Optional provider, cache model, result.provider |
| `backend/app/core/config.py` | Modified | openai_api_key, gemini_api_key |
| `backend/app/main.py` | Modified | Providers router |
| `backend/app/models/schemas.py` | Modified | provider in OptimizationResult |
| `backend/requirements.txt` | Modified | openai, google-genai |
| `backend/tests/test_providers.py` | Created | Provider and compare tests |
| `backend/tests/test_rate_limit.py` | Modified | Mock OptimizationResult |
| `frontend/src/components/ui/ProviderSelector/` | Created | 4-file pattern |
| `frontend/src/components/ui/ProviderBadge/` | Created | 4-file pattern |
| `frontend/src/components/ui/ProviderComparison/` | Created | 4-file pattern |
| `frontend/src/app/(app)/home/page.tsx` | Modified | ProviderSelector, compare section |
| `frontend/src/app/(app)/results/page.tsx` | Modified | ProviderBadge |
| `frontend/src/app/(app)/compare/page.tsx` | Created | Compare page |
| `frontend/src/context/OptimizationContext.tsx` | Modified | providerUsed, comparisonResult |
| `frontend/src/lib/api.ts` | Modified | getProviders, compareProviders, provider |
| `frontend/src/types/provider.ts` | Created | Provider types |
| `frontend/src/types/optimization.ts` | Modified | Optional provider |

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Provider factory with env-based availability | Providers enabled only when API keys are set; avoids runtime errors |
| Optional provider on POST /optimize | Backward compatibility; defaults to config |
| GET /providers returns available only | Frontend only shows providers the backend can use |
| POST /compare runs same optimization per provider | Fair comparison with identical input |
| model_name on LLMProvider | Cache stores actual model used instead of hardcoded string |
| provider in OptimizationResult | Cached results retain which provider generated them |

## Testing Checklist

- [x] GET /providers returns available providers
- [x] POST /optimize with optional provider works
- [x] POST /compare runs optimization for selected providers
- [x] Provider selector persists selection in localStorage
- [x] Provider badge shows on results page
- [x] Compare page displays side-by-side outputs
- [x] Backend validation passes (ruff, mypy, pytest)
- [x] Frontend validation passes (tsc, build, lint)

## Deployment Notes

- Set `OPENAI_API_KEY` and/or `GEMINI_API_KEY` in `backend/.env` to enable those providers. Anthropic remains default when `ANTHROPIC_API_KEY` is set.
- No frontend env changes required; provider list is fetched from the API.

## Validation

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
```
- tsc, build, lint: pass

```bash
cd backend && ruff check . && ruff format --check . && mypy app/ && pytest
```
- ruff, mypy, pytest: 65 passed
