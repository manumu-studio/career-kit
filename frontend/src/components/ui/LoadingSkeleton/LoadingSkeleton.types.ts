/** Types for LoadingSkeleton component. */

export type SkeletonVariant =
  | "text"
  | "block"
  | "circle"
  | "home"
  | "results"
  | "history"
  | "report"
  | "compare";

export interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}
