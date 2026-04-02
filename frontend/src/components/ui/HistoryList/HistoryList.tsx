"use client";

/** History list with sticky search/filter, card grid, and empty states. */
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FileSearch } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HistoryCard } from "@/components/ui/HistoryCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { GENERIC_ERROR_EN } from "@/lib/api-errors";
import type { HistoryListProps, HistoryTypeFilter } from "./HistoryList.types";

export function HistoryList({
  items,
  total,
  page,
  limit,
  companySearch,
  typeFilter,
  onCompanySearchChange,
  onTypeFilterChange,
  onPageChange,
  onView,
  onDelete,
  deletingId,
  isLoading,
  error,
}: HistoryListProps) {
  const t = useTranslations("historyList");
  const tHist = useTranslations("history");
  const tCommon = useTranslations("common");
  const reducedMotion = useReducedMotion();
  const totalPages = Math.ceil(total / limit) || 1;
  const displayError =
    error === GENERIC_ERROR_EN ? tCommon("genericError") : error;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const isEmpty = !isLoading && items.length === 0;
  const isNoResults = isEmpty && (companySearch.trim().length > 0 || typeFilter !== "all");

  const filterChips: { value: HistoryTypeFilter; label: string }[] = [
    { value: "all", label: t("filterAll") },
    { value: "research", label: t("filterResearch") },
    { value: "optimize", label: t("filterOptimization") },
  ];

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "sticky top-14 z-20 -mx-6 space-y-4 bg-background/90 px-6 py-3 backdrop-blur-sm md:-mx-0 md:px-0",
        )}
      >
        <Input
          aria-label={t("searchAriaLabel")}
          className="w-full"
          onChange={(e) => onCompanySearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          type="search"
          value={companySearch}
        />
        <div className="flex flex-wrap gap-2">
          {filterChips.map(({ value, label }) => (
            <Button
              key={value}
              variant={typeFilter === value ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full",
                typeFilter !== value &&
                  "border-border text-muted-foreground hover:text-foreground",
              )}
              onClick={() => onTypeFilterChange(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{displayError}</p>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} variant="block" className="h-40 w-full" />
          ))}
        </div>
      ) : isNoResults ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <FileSearch className="h-12 w-12 text-muted-foreground" aria-hidden />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("noResultsFound")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("tryAdjustingSearch")}
            </p>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <FileSearch className="size-14 text-muted-foreground" aria-hidden />
          <h2 className="text-xl font-semibold text-foreground">{tHist("emptyTitle")}</h2>
          <p className="text-muted-foreground">{tHist("emptySubtitle")}</p>
          <Link href="/home" className={buttonVariants()}>
            {tHist("emptyCta")}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reducedMotion ? { duration: 0 } : { delay: i * 0.1, duration: 0.2 }
                }
              >
                <HistoryCard
                  isDeleting={deletingId === item.id}
                  item={item}
                  onDelete={onDelete}
                  onView={onView}
                />
              </motion.div>
            ))}
          </div>

          {totalPages > 1 ? (
            <motion.div
              className="flex items-center justify-between border-t border-border pt-4"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-muted-foreground">
                {t("pageOf", { page, total: totalPages, count: total })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => onPageChange(page - 1)}
                >
                  {t("previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => onPageChange(page + 1)}
                >
                  {t("next")}
                </Button>
              </div>
            </motion.div>
          ) : null}
        </>
      )}
    </div>
  );
}
