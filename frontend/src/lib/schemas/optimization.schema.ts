/** Zod schemas for CV optimization API responses. */
import { z } from "zod";

const GapSchema = z.object({
  skill: z.string(),
  importance: z.enum(["critical", "preferred", "nice_to_have"]),
  suggestion: z.string(),
});

const CvSectionSchema = z.object({
  heading: z.string(),
  original: z.string(),
  optimized: z.string(),
  changes_made: z.array(z.string()),
});

export const OptimizationResultSchema = z
  .object({
    sections: z.array(CvSectionSchema),
    gap_analysis: z.array(GapSchema),
    keyword_matches: z.array(z.string()),
    keyword_misses: z.array(z.string()),
    match_score: z.number(),
    summary: z.string(),
    cache_hit: z.boolean().optional(),
    cached_at: z.string().nullable().optional(),
    analysis_id: z.string().nullable().optional(),
    provider: z.string().nullable().optional(),
  })
  .passthrough();

export type Gap = z.infer<typeof GapSchema>;
export type CvSection = z.infer<typeof CvSectionSchema>;
export type OptimizationResult = z.infer<typeof OptimizationResultSchema>;
