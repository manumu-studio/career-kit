/** Types for LoadingSkeleton component. */

export type SkeletonVariant = "text" | "block" | "circle";

export interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}
