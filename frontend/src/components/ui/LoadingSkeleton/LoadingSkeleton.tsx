/** Generic skeleton placeholder with shimmer animation. */
"use client";

import { cn } from "@/lib/utils";
import type { LoadingSkeletonProps } from "./LoadingSkeleton.types";

const baseClasses =
  "animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]";

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
    <div
      className={cn(baseClasses, variantClasses, className)}
      role="presentation"
      aria-hidden
    />
  );
}
