/** Hook tests for CV comparison labels. */
import { describe, expect, it } from "vitest";
import { useCvComparison } from "@/components/ui/CvComparison/useCvComparison";

describe("useCvComparison", () => {
  it("returns stable display labels", () => {
    const state = useCvComparison();
    expect(state.originalLabel).toBe("Original");
    expect(state.optimizedLabel).toBe("Optimized");
    expect(state.changesLabel).toBe("Changes made");
  });
});
