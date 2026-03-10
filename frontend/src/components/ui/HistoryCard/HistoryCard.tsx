"use client";

/** Compact card for a single analysis history entry. */
import { useTranslations } from "next-intl";
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
        "rounded-lg border p-4 transition",
        isExpired
          ? "border-amber-800/50 bg-slate-900/40"
          : "border-slate-800 bg-slate-900/60",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate text-base font-semibold text-white">
            {item.company_name ?? t("unknownCompany")}
          </h3>
          {item.job_title ? (
            <p className="truncate text-sm text-slate-300">{item.job_title}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium",
              item.analysis_type === "research" && "bg-sky-500/20 text-sky-300",
              item.analysis_type === "optimize" && "bg-emerald-500/20 text-emerald-300",
              item.analysis_type === "both" && "bg-violet-500/20 text-violet-300",
            )}
          >
            {typeLabel}
          </span>
          {item.cache_hit ? (
            <span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">
              {t("cached")}
            </span>
          ) : null}
          {item.match_score !== null ? (
            <span className="rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-slate-200">
              {item.match_score}% ATS
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        {relativeDate}
        {isExpired ? (
          <span className="ml-2 text-amber-400">{t("mayBeOutdated")}</span>
        ) : null}
      </p>

      <div className="mt-4 flex gap-2">
        <button
          className="rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
          onClick={() => onView(item.id)}
          type="button"
        >
          {t("view")}
        </button>
        <button
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-300 transition hover:border-rose-500 hover:text-rose-300 disabled:opacity-50"
          disabled={isDeleting}
          onClick={() => onDelete(item.id)}
          type="button"
        >
          {isDeleting ? t("deleting") : t("delete")}
        </button>
      </div>
    </section>
  );
}
