/** Types for ExportToolbar component. */

import type { CoverLetterResult } from "@/types/cover-letter";
import type { OptimizationResult } from "@/types/optimization";

export interface ExportToolbarProps {
  optimizationResult: OptimizationResult;
  coverLetter: CoverLetterResult | null;
}
