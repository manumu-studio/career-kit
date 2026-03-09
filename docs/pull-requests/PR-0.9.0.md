# PR-0.10.0 — UX Polish & Error Handling

**Branch:** `feature/ux-polish` → `main`
**Version:** `0.10.0`
**Date:** 2026-03-09
**Status:** ✅ Ready to merge

---

## Summary

Adds UX polish and error handling: React error boundary, typed API errors with retry, toast notifications, loading skeletons, progress bar during optimization, form validation (PDF 5MB, job description 50–10k chars), responsive layouts, and accessibility improvements (ARIA, focus rings, live regions).

## Files Changed

| File | Action | Notes |
|------|--------|------|
| ErrorBoundary/, Toast/, LoadingSkeleton/, ProgressBar/, FormField/ | Created | New UI components |
| api-errors.ts, validation.ts | Created | Error types, Zod schemas |
| api.ts | Modified | fetchWithRetry, ApiError |
| layout.tsx | Modified | ErrorBoundary, ToastProvider |
| globals.css | Modified | Shimmer, focus-visible |
| home/page, results/page | Modified | Progress bar, toasts, validation |
| history/[id], history/compare | Modified | Skeletons, Suspense |
| JobDescription, FileUpload, ScoreCard, GapAnalysis, ExportToolbar | Modified | Validation, responsive, ARIA |

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Toast at root layout | App-wide feedback without prop drilling |
| ApiError + handleApiError | Centralized, user-friendly error messages |
| fetchWithRetry for 5xx only | 4xx are client errors; no retry |
| GapAnalysis accordion on mobile | Save vertical space on small screens |
| ExportToolbar fixed bottom on mobile | Thumb-friendly access to export actions |

## Testing Checklist

- [ ] Error boundary shows fallback when component throws
- [ ] API errors show toast (e.g. invalid PDF, 5xx)
- [ ] Progress bar advances during optimization
- [ ] History detail shows skeletons while loading
- [ ] File upload rejects non-PDF and >5MB with clear message
- [ ] Job description shows inline validation (<50 chars)
- [ ] Results page usable on 375px width
- [ ] Tab through all interactive elements
- [ ] `prefers-reduced-motion` disables shimmer

## Deployment Notes

No env or config changes. Frontend-only.

## Validation (commands + results)

```bash
cd frontend && npx tsc --noEmit && npm run build && npm run lint
# ✓ All pass
```
