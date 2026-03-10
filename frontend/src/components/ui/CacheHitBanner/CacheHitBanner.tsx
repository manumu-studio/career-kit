"use client";

/** Subtle banner prompting user to use cached results or run again. */
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CacheHitBannerProps } from "./CacheHitBanner.types";

function formatDaysAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function CacheHitBanner({
  variant,
  match,
  onUseCached,
  onRunAgain,
  className,
}: CacheHitBannerProps) {
  const companyName = match.company_name ?? "this company";
  const daysAgo = formatDaysAgo(match.created_at);

  const message =
    variant === "research"
      ? `We already researched ${companyName} ${daysAgo}. Use cached results?`
      : `You optimized for this exact job description ${daysAgo}. View previous results?`;

  const primaryLabel = variant === "research" ? "Use Cached" : "View Previous";
  const secondaryLabel = variant === "research" ? "Research Again" : "Optimize Again";

  return (
    <div
      className={cn(
        "rounded-lg border border-primary/30 bg-primary/10 px-4 py-3",
        className,
      )}
    >
      <p className="mb-3 text-sm text-foreground">{message}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onUseCached}>
          {primaryLabel}
        </Button>
        <Button variant="outline" size="sm" onClick={onRunAgain}>
          {secondaryLabel}
        </Button>
      </div>
    </div>
  );
}
