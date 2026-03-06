"use client";

/** History list with search, filter chips, cards, and pagination. */
import { cn } from "@/lib/utils";
import { HistoryCard } from "@/components/ui/HistoryCard";
import type { HistoryListProps, HistoryTypeFilter } from "./HistoryList.types";

const FILTER_CHIPS: { value: HistoryTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "research", label: "Research" },
  { value: "optimize", label: "Optimization" },
];

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
  const totalPages = Math.ceil(total / limit) || 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <input
          aria-label="Search by company name"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          onChange={(e) => onCompanySearchChange(e.target.value)}
          placeholder="Search by company name..."
          type="search"
          value={companySearch}
        />

        <div className="flex flex-wrap gap-2">
          {FILTER_CHIPS.map(({ value, label }) => (
            <button
              key={value}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition",
                typeFilter === value
                  ? "bg-sky-500 text-slate-950"
                  : "border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-200",
              )}
              onClick={() => onTypeFilterChange(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-slate-400">
          No analyses yet. Run company research or CV optimization to see your history.
        </p>
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
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <p className="text-sm text-slate-400">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40"
                  disabled={!hasPrev}
                  onClick={() => onPageChange(page - 1)}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40"
                  disabled={!hasNext}
                  onClick={() => onPageChange(page + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
