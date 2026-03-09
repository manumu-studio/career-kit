# ENTRY-6 — Multi-Provider LLM Support

**Date:** 2026-03-09
**Type:** Feature
**Branch:** `feature/multi-provider-llm`
**Version:** `0.6.0`
---
## What I Did

Added support for multiple LLM providers (Anthropic Claude, OpenAI GPT-4o, Google Gemini) so users can choose which model optimizes their CV. Implemented a provider factory that resolves the active provider from config or request; providers are only available when their API keys are set. Added endpoints to list available providers and run side-by-side comparisons. The frontend now has a provider selector on the home page (persisted in localStorage), a provider badge on results, and a dedicated compare page to run the same optimization across multiple providers and view outputs side by side. Fixed a Gemini retry type error that blocked mypy, made the cache store the actual model name instead of a hardcoded string, and added a provider field to optimization results so cached responses retain which provider generated them.

## Files Touched

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
| `frontend/src/components/ui/ProviderSelector/` | Created | Dropdown, localStorage persistence |
| `frontend/src/components/ui/ProviderBadge/` | Created | Badge on results |
| `frontend/src/components/ui/ProviderComparison/` | Created | Compare UI |
| `frontend/src/app/(app)/home/page.tsx` | Modified | ProviderSelector, compare section |
| `frontend/src/app/(app)/results/page.tsx` | Modified | ProviderBadge |
| `frontend/src/app/(app)/compare/page.tsx` | Created | Compare page |
| `frontend/src/context/OptimizationContext.tsx` | Modified | providerUsed, comparisonResult |
| `frontend/src/lib/api.ts` | Modified | getProviders, compareProviders, provider |
| `frontend/src/types/provider.ts` | Created | Provider types |
| `frontend/src/types/optimization.ts` | Modified | Optional provider |

## Decisions (rationale bullets)

- **Provider factory:** Resolves provider from config or request; only exposes providers whose API keys are set.
- **Optional provider on optimize:** Keeps backward compatibility; defaults to config when omitted.
- **model_name on providers:** Cache stores the actual model used instead of a hardcoded string.
- **provider in OptimizationResult:** Cached results retain which provider generated them; frontend can show the badge even after refresh.
- **Gemini retry:** google-genai SDK expects a single string for retry contents, not a list; fixed by concatenating into one prompt.

## Still Open (known gaps)

- None. All planned work and post-implementation fixes are complete.

## Validation (commands + results)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
```
- tsc, build, lint: pass

```bash
cd backend && ruff check . && ruff format --check . && mypy app/ && pytest
```
- ruff, mypy, pytest: 65 passed
