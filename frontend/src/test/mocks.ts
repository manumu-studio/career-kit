/** Deterministic test factories for optimization domain data. */
import type { CvSection, Gap, OptimizationResult } from "@/types/optimization";

export function mockCvSection(): CvSection {
  return {
    heading: "Experience",
    original: "Built APIs for internal tools.",
    optimized: "Built resilient APIs for internal tools with measurable outcomes.",
    changes_made: ["Added ATS keywords", "Added measurable impact"],
  };
}

export function mockGap(): Gap {
  return {
    skill: "Kubernetes",
    importance: "preferred",
    suggestion: "Consider adding one production deployment bullet.",
  };
}

export function mockOptimizationResult(): OptimizationResult {
  return {
    sections: [
      mockCvSection(),
      {
        heading: "Projects",
        original: "Created dashboards.",
        optimized: "Created dashboards with performance tracking and stakeholder insights.",
        changes_made: ["Improved specificity"],
      },
    ],
    gap_analysis: [
      {
        skill: "System Design",
        importance: "critical",
        suggestion: "Add architecture and scaling examples.",
      },
      mockGap(),
    ],
    keyword_matches: ["Python", "FastAPI", "React"],
    keyword_misses: ["AWS"],
    match_score: 75,
    summary: "Strong fit with a few infrastructure gaps.",
  };
}
