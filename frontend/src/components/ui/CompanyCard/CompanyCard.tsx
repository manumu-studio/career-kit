"use client";

/** Compact card summarizing researched company insights for upload flow. */
import { cn } from "@/lib/utils";
import type { CompanyCardProps } from "./CompanyCard.types";

function sentimentStyles(sentiment: "positive" | "mixed" | "negative"): string {
  if (sentiment === "positive") {
    return "bg-emerald-500/15 text-emerald-300";
  }
  if (sentiment === "negative") {
    return "bg-rose-500/15 text-rose-300";
  }
  return "bg-amber-500/15 text-amber-300";
}

function qualityStyles(quality: "high" | "medium" | "low"): string {
  if (quality === "high") {
    return "bg-emerald-500/15 text-emerald-300";
  }
  if (quality === "medium") {
    return "bg-amber-500/15 text-amber-300";
  }
  return "bg-orange-500/15 text-orange-300";
}

export function CompanyCard({
  profile,
  researchQuality,
  onViewFullReport,
  className,
}: CompanyCardProps) {
  return (
    <section className={cn("space-y-4 rounded-lg border border-slate-800 p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">{profile.name}</h3>
          <p className="text-sm text-slate-300">
            {profile.industry} • {profile.size_estimate}
          </p>
        </div>
        <span className={cn("rounded-full px-2 py-1 text-xs font-medium", qualityStyles(researchQuality))}>
          {researchQuality} quality
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {profile.core_values.slice(0, 3).map((value) => (
          <span
            key={value}
            className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200"
          >
            {value}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">Employee sentiment</span>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium capitalize",
            sentimentStyles(profile.employee_sentiment.overall),
          )}
        >
          {profile.employee_sentiment.overall}
        </span>
      </div>

      <button
        className="text-sm font-medium text-sky-300 transition hover:text-sky-200"
        onClick={onViewFullReport}
        type="button"
      >
        View Full Report →
      </button>
    </section>
  );
}
