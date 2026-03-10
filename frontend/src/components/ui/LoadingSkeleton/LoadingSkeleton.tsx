/** Generic skeleton placeholder using ShadCN Skeleton. */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LoadingSkeletonProps } from "./LoadingSkeleton.types";

export function LoadingSkeleton({
  variant = "text",
  className,
}: LoadingSkeletonProps) {
  const variantClasses =
    variant === "text"
      ? "h-4 rounded"
      : variant === "block"
        ? "rounded-lg"
        : "rounded-full";

  return (
    <Skeleton
      className={cn(variantClasses, className)}
      role="presentation"
      aria-hidden
    />
  );
}
