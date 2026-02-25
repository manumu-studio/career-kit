/** Sorts and styles gap analysis entries by importance. */
import type { Gap } from "@/types/optimization";

const IMPORTANCE_WEIGHT: Record<Gap["importance"], number> = {
  critical: 0,
  preferred: 1,
  nice_to_have: 2,
};

const IMPORTANCE_STYLES: Record<Gap["importance"], string> = {
  critical: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  preferred: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  nice_to_have: "bg-slate-700/60 text-slate-200 border border-slate-600",
};

export function useGapAnalysis(gaps: Gap[]) {
  const sortedGaps = [...gaps].sort(
    (left, right) => IMPORTANCE_WEIGHT[left.importance] - IMPORTANCE_WEIGHT[right.importance],
  );

  const getBadgeClassName = (importance: Gap["importance"]): string => IMPORTANCE_STYLES[importance];

  return {
    sortedGaps,
    getBadgeClassName,
  };
}
