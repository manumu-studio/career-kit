/** Cover letter API types matching backend schemas. */

export type { CoverLetterResult } from "@/lib/schemas/cover-letter.schema";

export type CoverLetterTone = "professional" | "conversational" | "enthusiastic";

export type Locale = "en" | "es";

export interface CoverLetterRequest {
  cv_text: string;
  job_description: string;
  company_name: string;
  hiring_manager: string | null;
  tone: CoverLetterTone;
  language?: Locale;
}
