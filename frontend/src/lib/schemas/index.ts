/** Barrel exports for API response Zod schemas and inferred types. */
export {
  ApiErrorBodySchema,
  type ApiErrorBody,
} from "@/lib/schemas/api-error.schema";
export {
  CachedMatchInfoSchema,
  CheckCacheResponseSchema,
  type CachedMatchInfo,
  type CheckCacheResponse,
} from "@/lib/schemas/cache.schema";
export {
  CoverLetterResultSchema,
  type CoverLetterResult,
} from "@/lib/schemas/cover-letter.schema";
export {
  CompanyResearchResultSchema,
  type CompanyProfile,
  type CompanyReport,
  type CompanyResearchResult,
  type EmployeeSentiment,
  type InterviewInsight,
  type NewsItem,
} from "@/lib/schemas/company.schema";
export {
  HistoryDetailResponseSchema,
  HistoryListItemSchema,
  HistoryListResponseSchema,
  HistoryStatsResponseSchema,
  type HistoryAnalysisType,
  type HistoryDetailResponse,
  type HistoryListItem,
  type HistoryListResponse,
  type HistoryStatsResponse,
} from "@/lib/schemas/history.schema";
export {
  OptimizationResultSchema,
  type CvSection,
  type Gap,
  type OptimizationResult,
} from "@/lib/schemas/optimization.schema";
export {
  ComparisonResultSchema,
  ProvidersResponseSchema,
  type ComparisonResult,
  type ProvidersResponse,
} from "@/lib/schemas/provider.schema";
