/** Cover letter API types matching backend schemas. */

export type CoverLetterTone = "professional" | "conversational" | "enthusiastic";

export interface CoverLetterResult {
  greeting: string;
  opening_paragraph: string;
  body_paragraphs: string[];
  closing_paragraph: string;
  sign_off: string;
  key_selling_points: string[];
  tone_used: string;
  word_count: number;
}

export interface CoverLetterRequest {
  cv_text: string;
  job_description: string;
  company_name: string;
  hiring_manager: string | null;
  tone: CoverLetterTone;
}
