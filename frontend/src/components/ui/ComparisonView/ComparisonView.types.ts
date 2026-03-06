/** Props for side-by-side optimization comparison. */
import type { OptimizationResult } from "@/types/optimization";

export interface ComparisonViewProps {
  resultA: OptimizationResult;
  resultB: OptimizationResult;
  labelA?: string;
  labelB?: string;
  className?: string;
}
