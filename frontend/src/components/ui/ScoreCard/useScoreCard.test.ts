/** Hook tests for score card labels, colors, and boundaries. */
import { describe, expect, it } from "vitest";
import { useScoreCard } from "@/components/ui/ScoreCard/useScoreCard";

describe("useScoreCard", () => {
  it("returns low match state for scores under 40", () => {
    const state = useScoreCard(20);
    expect(state.label).toBe("Low Match");
    expect(state.accentClass).toBe("text-rose-400");
  });

  it("returns moderate match state for scores 40 through 69", () => {
    const state = useScoreCard(55);
    expect(state.label).toBe("Moderate Match");
    expect(state.accentClass).toBe("text-amber-400");
  });

  it("returns strong match state for scores 70 and above", () => {
    const state = useScoreCard(85);
    expect(state.label).toBe("Strong Match");
    expect(state.accentClass).toBe("text-emerald-400");
  });

  it("clamps boundary values into 0-100", () => {
    expect(useScoreCard(-10).score).toBe(0);
    expect(useScoreCard(120).score).toBe(100);
  });

  it("uses exact threshold boundaries correctly", () => {
    expect(useScoreCard(39).label).toBe("Low Match");
    expect(useScoreCard(40).label).toBe("Moderate Match");
    expect(useScoreCard(69).label).toBe("Moderate Match");
    expect(useScoreCard(70).label).toBe("Strong Match");
  });
});
