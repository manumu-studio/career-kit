/** Types for history API responses. */

export type HistoryAnalysisType = "research" | "optimize" | "both";

export interface HistoryListItem {
  id: string;
  analysis_type: HistoryAnalysisType;
  company_name: string | null;
  job_title: string | null;
  job_description_preview: string | null;
  cv_filename: string | null;
  created_at: string;
  expires_at: string;
  cache_hit: boolean;
  match_score: number | null;
}

export interface HistoryListResponse {
  items: HistoryListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface HistoryDetailResponse extends HistoryListItem {
  company_research_json: Record<string, unknown> | null;
  optimization_result_json: Record<string, unknown> | null;
}

export interface HistoryStatsResponse {
  total_analyses: number;
  cache_hits: number;
  total_cost_usd: number;
}

export interface HistoryListParams {
  type?: HistoryAnalysisType;
  company?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CachedMatchInfo {
  analysis_id: string;
  company_name: string | null;
  job_title: string | null;
  created_at: string;
}

export interface CheckCacheResponse {
  cached: boolean;
  match: CachedMatchInfo | null;
}
