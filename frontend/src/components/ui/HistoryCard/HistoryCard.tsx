"use client";

/** Compact card for a single analysis history entry with mini gauge and hover animation. */
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { cn } from "@/lib/utils";
import type { HistoryCardProps } from "./HistoryCard.types";

export function HistoryCard({
  item,
  onView,
  onDelete,
  isDeleting = false,
}: HistoryCardProps) {
  const t = useTranslations("historyCard");
  const reducedMotion = useReducedMotion();
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
    <motion.div
      whileHover={reducedMotion ? {} : { y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.2 }}
      className={cn(
        "cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:bg-muted/30 hover:border-l-2 hover:border-l-primary",
        isExpired && "border-warning/50 bg-muted/40",
      )}
      onClick={() => onView(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(item.id);
        }
      }}
    >
      <div className="flex items-start gap-3">
        {item.match_score !== null ? (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <ScoreGauge score={item.match_score} size={48} label="" />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">
            {item.company_name ?? t("unknownCompany")}
          </h3>
          {item.job_title ? (
            <p className="truncate text-sm text-muted-foreground">{item.job_title}</p>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            {relativeDate}
            {isExpired ? (
              <span className="ml-2 text-warning">{t("mayBeOutdated")}</span>
            ) : null}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
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
        </div>
      </div>

      <div
        className="mt-3 flex gap-2 border-t border-border pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <Button size="sm" variant="outline" onClick={() => onView(item.id)}>
          {t("view")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => onDelete(item.id)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isDeleting ? t("deleting") : t("delete")}
        </Button>
      </div>
    </motion.div>
  );
}
