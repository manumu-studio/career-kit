/** Zod schemas for history list/detail/stats API responses. */
import { z } from "zod";

const HistoryAnalysisTypeSchema = z.enum(["research", "optimize", "both"]);

export const HistoryListItemSchema = z.object({
  id: z.string(),
  analysis_type: HistoryAnalysisTypeSchema,
  company_name: z.string().nullable(),
  job_title: z.string().nullable(),
  job_description_preview: z.string().nullable(),
  cv_filename: z.string().nullable(),
  created_at: z.string(),
  expires_at: z.string(),
  cache_hit: z.boolean(),
  match_score: z.number().nullable(),
});

export const HistoryListResponseSchema = z
  .object({
    items: z.array(HistoryListItemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  })
  .passthrough();

export const HistoryDetailResponseSchema = HistoryListItemSchema.extend({
  company_research_json: z.record(z.string(), z.unknown()).nullable(),
  optimization_result_json: z.record(z.string(), z.unknown()).nullable(),
}).passthrough();

export const HistoryStatsResponseSchema = z
  .object({
    total_analyses: z.number(),
    cache_hits: z.number(),
    total_cost_usd: z.number(),
  })
  .passthrough();

export type HistoryAnalysisType = z.infer<typeof HistoryAnalysisTypeSchema>;
export type HistoryListItem = z.infer<typeof HistoryListItemSchema>;
export type HistoryListResponse = z.infer<typeof HistoryListResponseSchema>;
export type HistoryDetailResponse = z.infer<typeof HistoryDetailResponseSchema>;
export type HistoryStatsResponse = z.infer<typeof HistoryStatsResponseSchema>;
