/** Types for CoverLetterDisplay component. */

import type { CoverLetterResult } from "@/types/cover-letter";

export interface CoverLetterDisplayProps {
  coverLetter: CoverLetterResult;
  companyName?: string | null;
  roleName?: string | null;
}
