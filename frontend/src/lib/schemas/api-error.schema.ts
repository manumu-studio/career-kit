/** Zod schema for JSON error bodies from the backend API. */
import { z } from "zod";

export const ApiErrorBodySchema = z
  .object({
    error: z.string().optional(),
    detail: z.string().optional(),
    code: z.string().optional(),
  })
  .passthrough();

export type ApiErrorBody = z.infer<typeof ApiErrorBodySchema>;
