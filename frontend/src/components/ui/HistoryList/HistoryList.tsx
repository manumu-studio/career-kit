"use client";

/** History list with search, filter chips, cards, and pagination. */
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HistoryCard } from "@/components/ui/HistoryCard";
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
  const tCommon = useTranslations("common");
  const totalPages = Math.ceil(total / limit) || 1;
  const displayError =
    error === GENERIC_ERROR_EN ? tCommon("genericError") : error;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const filterChips: { value: HistoryTypeFilter; label: string }[] = [
    { value: "all", label: t("filterAll") },
    { value: "research", label: t("filterResearch") },
    { value: "optimize", label: t("filterOptimization") },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
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
                typeFilter !== value && "border-border text-muted-foreground hover:text-foreground",
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
        <div className="flex items-center justify-center py-12">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">{t("emptyMessage")}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <HistoryCard
                isDeleting={deletingId === item.id}
                item={item}
                key={item.id}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-border pt-4">
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
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
