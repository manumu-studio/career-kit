/** Zod schema for cache check API responses. */
import { z } from "zod";

export const CachedMatchInfoSchema = z.object({
  analysis_id: z.string(),
  company_name: z.string().nullable(),
  job_title: z.string().nullable(),
  created_at: z.string(),
});

export const CheckCacheResponseSchema = z
  .object({
    cached: z.boolean(),
    match: CachedMatchInfoSchema.nullable(),
  })
  .passthrough();

export type CachedMatchInfo = z.infer<typeof CachedMatchInfoSchema>;
export type CheckCacheResponse = z.infer<typeof CheckCacheResponseSchema>;
