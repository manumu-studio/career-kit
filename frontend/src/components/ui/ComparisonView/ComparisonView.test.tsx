/** Component tests for ComparisonView — comparison data, tabs. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { ComparisonView } from "./ComparisonView";
import { mockOptimizationResult } from "@/test/mocks";

describe("ComparisonView", () => {
  const resultA = mockOptimizationResult({
    match_score: 78,
    summary: "Strong fit for the role.",
    sections: [
      { heading: "Experience", original: "x", optimized: "y", changes_made: [] },
    ],
  });
  const resultB = mockOptimizationResult({
    match_score: 72,
    summary: "Good fit with minor gaps.",
    sections: [
      { heading: "Experience", original: "a", optimized: "b", changes_made: [] },
    ],
  });

  it("renders both result labels and ATS scores", () => {
    render(<ComparisonView resultA={resultA} resultB={resultB} />);

    expect(screen.getByRole("heading", { name: "Version A" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Version B" })).toBeInTheDocument();
    expect(screen.getByText("78% ATS")).toBeInTheDocument();
    expect(screen.getByText("72% ATS")).toBeInTheDocument();
  });

  it("renders summaries for both results", () => {
    render(<ComparisonView resultA={resultA} resultB={resultB} />);

    expect(screen.getByText("Strong fit for the role.")).toBeInTheDocument();
    expect(screen.getByText("Good fit with minor gaps.")).toBeInTheDocument();
  });

  it("renders keyword matches count", () => {
    render(<ComparisonView resultA={resultA} resultB={resultB} />);

    expect(screen.getAllByText("Keyword matches").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3 matches, 1 misses/).length).toBeGreaterThan(0);
  });

  it("renders Section comparison heading", () => {
    render(<ComparisonView resultA={resultA} resultB={resultB} />);

    expect(screen.getByRole("heading", { name: "Section comparison" })).toBeInTheDocument();
  });

  it("renders custom labels when provided", () => {
    render(
      <ComparisonView
        resultA={resultA}
        resultB={resultB}
        labelA="Claude"
        labelB="GPT"
      />,
    );

    expect(screen.getByRole("heading", { name: "Claude" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "GPT" })).toBeInTheDocument();
  });
});
