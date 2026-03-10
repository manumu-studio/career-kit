/** Sorts and styles gap analysis entries by importance. */
import type { Gap } from "@/types/optimization";

const IMPORTANCE_WEIGHT: Record<Gap["importance"], number> = {
  critical: 0,
  preferred: 1,
  nice_to_have: 2,
};

/** Severity label keys for i18n. */
export const SEVERITY_KEYS: Record<Gap["importance"], "severityCritical" | "severityImportant" | "severityNiceToHave"> = {
  critical: "severityCritical",
  preferred: "severityImportant",
  nice_to_have: "severityNiceToHave",
};

/** Badge color classes: Critical (rose), Important (amber), Nice-to-have (sky). */
export const SEVERITY_BADGE_CLASSES: Record<Gap["importance"], string> = {
  critical: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  preferred: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  nice_to_have: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
};

export type SortMode = "severity" | "name";

export function useGapAnalysis(gaps: Gap[], sortMode: SortMode = "severity") {
  const sortedGaps = [...gaps].sort((left, right) => {
    if (sortMode === "name") {
      return left.skill.localeCompare(right.skill);
    }
    return IMPORTANCE_WEIGHT[left.importance] - IMPORTANCE_WEIGHT[right.importance];
  });

  return {
    sortedGaps,
  };
}
