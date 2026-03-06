"use client";

/** Subtle banner prompting user to use cached results or run again. */
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
        "rounded-lg border border-sky-800/60 bg-sky-950/40 px-4 py-3",
        className,
      )}
    >
      <p className="mb-3 text-sm text-slate-200">{message}</p>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
          onClick={onUseCached}
          type="button"
        >
          {primaryLabel}
        </button>
        <button
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-200"
          onClick={onRunAgain}
          type="button"
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}
