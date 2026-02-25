/** Computes keyword match totals for display summaries. */
import type { KeywordMatchProps } from "@/components/ui/KeywordMatch/KeywordMatch.types";

interface KeywordMatchState {
  totalKeywords: number;
  matchedCount: number;
  summaryLabel: string;
}

export function useKeywordMatch({
  matches,
  misses,
}: Pick<KeywordMatchProps, "matches" | "misses">): KeywordMatchState {
  const matchedCount = matches.length;
  const totalKeywords = matchedCount + misses.length;
  const summaryLabel = `${matchedCount} of ${totalKeywords} keywords matched`;

  return {
    totalKeywords,
    matchedCount,
    summaryLabel,
  };
}
