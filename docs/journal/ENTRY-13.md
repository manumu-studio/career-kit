# ENTRY-13 — App Pages Polish

**Date:** 2026-03-10
**Type:** Feature
**Branch:** `feature/app-pages-polish`
**Version:** `0.13.0`

---

## What I Did

Redesigned all authenticated app pages for clearer hierarchy and polished interactions.

**Home:** Step-by-step layout (Upload CV → Job Description → Options → Submit), collapsible company research, pill-style provider selector, larger file upload with animated border, full-page progress overlay.

**Results:** Semi-circular score gauge with color bands, keyword chips with tooltips, card-per-gap layout with severity badges, side-by-side CV comparison (tabs on mobile), paper-style cover letter, floating export toolbar.

**History:** Card grid with mini score gauges, sticky search/filter bar, empty states for no analyses vs no results.

**Report:** Five card sections (Culture Reality, Role-Specific Expectations, Interview & Team Signals, Risk Flags, Candidate Strategy) with icons, confidence badges, collapsible on mobile.

**Compare:** Score bar chart, keyword overlap summary, side-by-side columns (desktop) or tabs (mobile), empty state with CTA. Enabled Compare nav link.

**Polish:** Page transition animations (AnimatePresence), page-specific loading skeletons, consistent empty states (icon + heading + CTA).

## Files Touched

| File                                                                | Action           | Notes                      |
| ------------------------------------------------------------------- | ---------------- | -------------------------- |
| home/page.tsx, FileUpload, ProviderSelector, ProgressBar            | Modified         | Step layout, animations    |
| results/page.tsx, ScoreGauge, ScoreCard, KeywordMatch, KeywordChips | Modified         | Gauge, chips, layout       |
| GapAnalysis, CvComparison, CoverLetterDisplay, ExportToolbar        | Modified         | Cards, comparison, export  |
| history/page.tsx, HistoryList, HistoryCard                          | Modified         | Grid, search, empty states |
| report/page.tsx, CompanyReport                                      | Modified         | Card sections, collapsible |
| compare/page.tsx, ProviderComparison                                | Modified         | Chart, columns, tabs       |
| layout.tsx, PageTransition                                          | Modified/Created | Page transitions           |
| LoadingSkeleton                                                     | Modified         | Page variants              |
| Navbar                                                              | Modified         | Compare link               |
| en.json, es.json                                                    | Modified         | New keys                   |

## Decisions (rationale bullets)

- **AnimatePresence in layout**: Single place for page transitions; pathname key triggers exit/enter
- **LoadingSkeleton variants**: Match final layout to avoid CLS when content loads
- **Report collapsible**: Mobile-first; useIsDesktop via matchMedia
- **Compare empty state**: Show CTA instead of redirect so users can discover the feature

## Still Open (known gaps)

- View full results link on Compare goes to /results; could filter by provider in future

## Validation (commands + results)

- Frontend: `npx tsc --noEmit && npm run build && npm run lint && npm run test` — 158 tests pass
