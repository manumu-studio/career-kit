/** Shared optimization result types returned by backend API. */
export interface Gap {
  skill: string;
  importance: "critical" | "preferred" | "nice_to_have";
  suggestion: string;
}

/** A CV section before/after CV optimization. */
export interface CvSection {
  heading: string;
  original: string;
  optimized: string;
  changes_made: string[];
}

/** Top-level payload returned by optimization endpoint. */
export interface OptimizationResult {
  sections: CvSection[];
  gap_analysis: Gap[];
  keyword_matches: string[];
  keyword_misses: string[];
  match_score: number;
  summary: string;
}
