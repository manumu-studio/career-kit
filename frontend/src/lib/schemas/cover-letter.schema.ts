/** Zod schema for cover letter generation API response. */
import { z } from "zod";

export const CoverLetterResultSchema = z
  .object({
    greeting: z.string(),
    opening_paragraph: z.string(),
    body_paragraphs: z.array(z.string()),
    closing_paragraph: z.string(),
    sign_off: z.string(),
    key_selling_points: z.array(z.string()),
    tone_used: z.string(),
    word_count: z.number(),
  })
  .passthrough();

export type CoverLetterResult = z.infer<typeof CoverLetterResultSchema>;
