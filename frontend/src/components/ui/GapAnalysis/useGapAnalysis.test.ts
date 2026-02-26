/** Hook tests for gap sorting and badge styling helpers. */
import { describe, expect, it } from "vitest";
import { useGapAnalysis } from "@/components/ui/GapAnalysis/useGapAnalysis";
import type { Gap } from "@/types/optimization";

describe("useGapAnalysis", () => {
  it("sorts gaps by importance critical > preferred > nice_to_have", () => {
    const gaps: Gap[] = [
      { skill: "Docker", importance: "nice_to_have", suggestion: "Mention containers." },
      { skill: "System Design", importance: "critical", suggestion: "Add architecture examples." },
      { skill: "Kubernetes", importance: "preferred", suggestion: "Mention cluster usage." },
    ];
    const state = useGapAnalysis(gaps);

    expect(state.sortedGaps.map((gap) => gap.skill)).toEqual([
      "System Design",
      "Kubernetes",
      "Docker",
    ]);
  });

  it("returns style classes per importance", () => {
    const state = useGapAnalysis([]);
    expect(state.getBadgeClassName("critical")).toContain("text-rose-300");
    expect(state.getBadgeClassName("preferred")).toContain("text-amber-300");
    expect(state.getBadgeClassName("nice_to_have")).toContain("text-slate-200");
  });
});
