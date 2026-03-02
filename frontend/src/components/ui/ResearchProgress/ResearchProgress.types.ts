/** Props for displaying multi-step company research progress. */
import type { ResearchStep } from "@/types/company";

export interface ResearchProgressProps {
  currentStep: ResearchStep;
  className?: string;
}
