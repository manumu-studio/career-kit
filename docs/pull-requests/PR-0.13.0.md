# PR-0.13.0 — App Pages Polish

**Branch:** `feature/app-pages-polish` → `main`
**Version:** `0.13.0`
**Date:** 2026-03-10
**Status:** ✅ Ready to merge

---

## Summary

Redesigned all authenticated app pages (Home, Results, History, Report, Compare) for clearer hierarchy, better UX, and polished interactions. Added Framer Motion page transitions, page-specific loading skeletons, and consistent empty states.

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| home/page.tsx, FileUpload, ProviderSelector, ProgressBar | Modified | Step layout, collapsible CompanySearch |
| results/page.tsx, ScoreGauge, ScoreCard, KeywordMatch, KeywordChips | Modified | Gauge, chips, tooltips |
| GapAnalysis, CvComparison, CoverLetterDisplay, ExportToolbar | Modified | Cards, comparison, export |
| history/page.tsx, HistoryList, HistoryCard | Modified | Grid, search, empty states |
| report/page.tsx, CompanyReport | Modified | Card sections, collapsible |
| compare/page.tsx, ProviderComparison | Modified | Chart, columns, tabs |
| layout.tsx, PageTransition | Modified/Created | Page transitions |
| LoadingSkeleton | Modified | Page variants |
| Navbar | Modified | Compare link enabled |
| en.json, es.json | Modified | New keys |

## Architecture Decisions

| Decision | Why |
|----------|-----|
| AnimatePresence in layout | Page transitions in one place; pathname key triggers animations |
| LoadingSkeleton variants | Match layout shapes to avoid CLS |
| Report collapsible on mobile | Better UX on small screens |
| Compare empty state | CTA instead of redirect for discoverability |

## Testing Checklist

- [x] Home step layout, collapsible company research, provider selector
- [x] Results gauge, keywords, gaps, comparison, export
- [x] History card grid, search, empty states
- [x] Report card sections, collapsible mobile
- [x] Compare chart, columns/tabs, empty state
- [x] Page transitions
- [x] Loading skeletons
- [x] 158 tests pass

## Deployment Notes

None.

## Validation (commands + results)

- Frontend: `npx tsc --noEmit && npm run build && npm run lint && npm run test` — pass
