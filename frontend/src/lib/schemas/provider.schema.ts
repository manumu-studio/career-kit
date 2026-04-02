/** Zod schemas for LLM provider list and comparison API responses. */
import { z } from "zod";
import { OptimizationResultSchema } from "@/lib/schemas/optimization.schema";

const ProviderComparisonErrorSchema = z.object({ error: z.string() });

const ComparisonResultEntrySchema = z.union([
  OptimizationResultSchema,
  ProviderComparisonErrorSchema,
]);

export const ProvidersResponseSchema = z
  .object({
    available: z.array(z.string()),
    default: z.string(),
  })
  .passthrough();

export const ComparisonResultSchema = z
  .object({
    results: z.record(z.string(), ComparisonResultEntrySchema),
    comparison: z.object({
      score_delta: z.record(z.string(), z.number()),
      unique_keywords: z.record(z.string(), z.array(z.string())),
      processing_time_ms: z.record(z.string(), z.number()),
    }),
  })
  .passthrough();

export type ProvidersResponse = z.infer<typeof ProvidersResponseSchema>;
export type ComparisonResult = z.infer<typeof ComparisonResultSchema>;
