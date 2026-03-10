"use client";

/** Compact card for a single analysis history entry. */
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HistoryCardProps } from "./HistoryCard.types";

export function HistoryCard({
  item,
  onView,
  onDelete,
  isDeleting = false,
}: HistoryCardProps) {
  const t = useTranslations("historyCard");
  const isExpired = new Date(item.expires_at) < new Date();

  const date = new Date(item.created_at);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const relativeDate =
    diffDays === 0
      ? t("today")
      : diffDays === 1
        ? t("yesterday")
        : diffDays < 7
          ? t("daysAgo", { count: diffDays })
          : diffDays < 30
            ? t("weeksAgo", { count: Math.floor(diffDays / 7) })
            : date.toLocaleDateString();

  const typeLabel =
    item.analysis_type === "research"
      ? t("research")
      : item.analysis_type === "optimize"
        ? t("optimization")
        : t("both");

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition",
        isExpired && "border-warning/50 bg-muted/40",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate text-base font-semibold text-foreground">
            {item.company_name ?? t("unknownCompany")}
          </h3>
          {item.job_title ? (
            <p className="truncate text-sm text-muted-foreground">{item.job_title}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={cn(
              item.analysis_type === "research" && "bg-primary/20 text-primary",
              item.analysis_type === "optimize" && "bg-success/20 text-success",
              item.analysis_type === "both" && "bg-primary/20 text-primary",
            )}
          >
            {typeLabel}
          </Badge>
          {item.cache_hit ? (
            <Badge variant="secondary">{t("cached")}</Badge>
          ) : null}
          {item.match_score !== null ? (
            <Badge variant="secondary">{item.match_score}% ATS</Badge>
          ) : null}
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {relativeDate}
        {isExpired ? (
          <span className="ml-2 text-warning">{t("mayBeOutdated")}</span>
        ) : null}
      </p>

      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={() => onView(item.id)}>
          {t("view")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isDeleting}
          onClick={() => onDelete(item.id)}
          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isDeleting ? t("deleting") : t("delete")}
        </Button>
      </div>
    </section>
  );
}
