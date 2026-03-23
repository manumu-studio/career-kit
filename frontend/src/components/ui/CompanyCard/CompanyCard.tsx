"use client";

/** Compact card summarizing researched company insights for upload flow. */
import { cn } from "@/lib/utils";
import type { CompanyCardProps } from "./CompanyCard.types";

function sentimentStyles(sentiment: "positive" | "mixed" | "negative"): string {
  if (sentiment === "positive") {
    return "bg-success/15 text-success";
  }
  if (sentiment === "negative") {
    return "bg-destructive/15 text-destructive";
  }
  return "bg-warning/15 text-warning";
}

function qualityStyles(quality: "high" | "medium" | "low"): string {
  if (quality === "high") {
    return "bg-success/15 text-success";
  }
  if (quality === "medium") {
    return "bg-warning/15 text-warning";
  }
  return "bg-warning/15 text-warning";
}

export function CompanyCard({
  profile,
  researchQuality,
  onViewFullReport,
  className,
}: CompanyCardProps) {
  return (
    <section className={cn("space-y-4 rounded-lg border border-border p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">{profile.name}</h3>
          <p className="text-sm text-muted-foreground">
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
            className="rounded-full bg-muted px-2 py-1 text-xs text-foreground"
          >
            {value}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Employee sentiment</span>
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
        className="text-sm font-medium text-primary transition hover:text-primary/80"
        onClick={onViewFullReport}
        type="button"
      >
        View Full Report →
      </button>
    </section>
  );
}
