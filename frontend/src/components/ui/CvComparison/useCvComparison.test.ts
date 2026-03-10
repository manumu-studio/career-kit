/** Hook tests for CV comparison labels. */
import { describe, expect, it } from "vitest";
import { useCvComparison } from "@/components/ui/CvComparison/useCvComparison";

describe("useCvComparison", () => {
  it("returns translated display labels from t function", () => {
    const t = (key: string) =>
      ({ original: "Original", optimized: "Optimized", changesMade: "Changes made" })[key] ?? key;
    const state = useCvComparison(t);
    expect(state.originalLabel).toBe("Original");
    expect(state.optimizedLabel).toBe("Optimized");
    expect(state.changesLabel).toBe("Changes made");
  });
});
