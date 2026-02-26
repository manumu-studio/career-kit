/** Hook tests for keyword count and summary derivations. */
import { describe, expect, it } from "vitest";
import { useKeywordMatch } from "@/components/ui/KeywordMatch/useKeywordMatch";

describe("useKeywordMatch", () => {
  it("computes matched and total counts", () => {
    const state = useKeywordMatch({
      matches: ["Python", "React"],
      misses: ["Kubernetes"],
    });
    expect(state.matchedCount).toBe(2);
    expect(state.totalKeywords).toBe(3);
  });

  it("builds summary label from counts", () => {
    const state = useKeywordMatch({
      matches: ["Python"],
      misses: ["Docker", "Kubernetes"],
    });
    expect(state.summaryLabel).toBe("1 of 3 keywords matched");
  });
});
