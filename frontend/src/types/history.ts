/** Types for history API responses (inferred from Zod where applicable). */

import type { HistoryAnalysisType } from "@/lib/schemas/history.schema";

export type {
  CachedMatchInfo,
  CheckCacheResponse,
} from "@/lib/schemas/cache.schema";
export type {
  HistoryAnalysisType,
  HistoryDetailResponse,
  HistoryListItem,
  HistoryListResponse,
  HistoryStatsResponse,
} from "@/lib/schemas/history.schema";

export interface HistoryListParams {
  type?: HistoryAnalysisType;
  company?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
