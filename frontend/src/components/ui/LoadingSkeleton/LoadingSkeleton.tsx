/** Page-specific skeleton placeholders matching final layout shapes. */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LoadingSkeletonProps } from "./LoadingSkeleton.types";

export function LoadingSkeleton({
  variant = "text",
  className,
}: LoadingSkeletonProps) {
  if (variant === "home") {
    return <HomeSkeleton className={className} />;
  }
  if (variant === "results") {
    return <ResultsSkeleton className={className} />;
  }
  if (variant === "history") {
    return <HistorySkeleton className={className} />;
  }
  if (variant === "report") {
    return <ReportSkeleton className={className} />;
  }
  if (variant === "compare") {
    return <CompareSkeleton className={className} />;
  }

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

function HomeSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12", className)}
      role="presentation"
      aria-hidden
    >
      <Skeleton className="h-6 w-48" />
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-12 w-48 rounded-lg" />
    </div>
  );
}

function ResultsSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl space-y-8 px-6 py-10", className)}
      role="presentation"
      aria-hidden
    >
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

function HistorySkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-5xl space-y-8 px-6 py-10", className)}
      role="presentation"
      aria-hidden
    >
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ReportSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-5xl space-y-6 px-6 py-10", className)}
      role="presentation"
      aria-hidden
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

function CompareSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl space-y-6 px-6 py-10", className)}
      role="presentation"
      aria-hidden
    >
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
