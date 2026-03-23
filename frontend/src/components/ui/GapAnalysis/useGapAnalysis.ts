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

/** Badge color classes: Critical (destructive), Important (warning), Nice-to-have (primary). */
export const SEVERITY_BADGE_CLASSES: Record<Gap["importance"], string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  preferred: "bg-warning/15 text-warning border-warning/30",
  nice_to_have: "bg-primary/15 text-primary border-primary/30",
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
