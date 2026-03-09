/** Component tests for ProviderComparison — side-by-side results, loading, error. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { ProviderComparison } from "./ProviderComparison";
import type { ComparisonResult } from "@/types/provider";
import { mockComparisonResult, mockOptimizationResult } from "@/test/mocks";

describe("ProviderComparison", () => {
  it("renders Provider Comparison heading", () => {
    const data = mockComparisonResult();
    render(<ProviderComparison data={data} />);
    expect(screen.getByRole("heading", { name: "Provider Comparison" })).toBeInTheDocument();
  });

  it("renders Back to Upload link", () => {
    const data = mockComparisonResult();
    render(<ProviderComparison data={data} />);
    expect(screen.getByRole("link", { name: "Back to Upload" })).toBeInTheDocument();
  });

  it("renders side-by-side provider results with scores", () => {
    const data = mockComparisonResult({
      results: {
        anthropic: mockOptimizationResult({ match_score: 78, summary: "Strong fit." }),
        openai: mockOptimizationResult({ match_score: 72, summary: "Good fit." }),
      },
      comparison: {
        score_delta: { anthropic: 0, openai: -6 },
        unique_keywords: { anthropic: ["Claude"], openai: ["GPT"] },
        processing_time_ms: { anthropic: 1200, openai: 800 },
      },
    });
    render(<ProviderComparison data={data} />);

    expect(screen.getAllByText("Claude").length).toBeGreaterThan(0);
    expect(screen.getByText("GPT-4o")).toBeInTheDocument();
    expect(screen.getByText("Strong fit.")).toBeInTheDocument();
    expect(screen.getByText("Good fit.")).toBeInTheDocument();
    expect(screen.getByText("1200ms")).toBeInTheDocument();
    expect(screen.getByText("800ms")).toBeInTheDocument();
  });

  it("renders error state when result has error", () => {
    const data = mockComparisonResult({
      results: {
        anthropic: { error: "API rate limit exceeded" },
      },
      comparison: {
        score_delta: { anthropic: 0 },
        unique_keywords: { anthropic: [] },
        processing_time_ms: { anthropic: 0 },
      },
    });
    render(<ProviderComparison data={data} />);

    expect(screen.getByText("API rate limit exceeded")).toBeInTheDocument();
  });

  it("renders No result when provider result is undefined", () => {
    const data = {
      results: { anthropic: undefined },
      comparison: {
        score_delta: { anthropic: 0 },
        unique_keywords: { anthropic: [] },
        processing_time_ms: { anthropic: 0 },
      },
    } as unknown as ComparisonResult;
    render(<ProviderComparison data={data} />);

    expect(screen.getByText("No result")).toBeInTheDocument();
  });
});
