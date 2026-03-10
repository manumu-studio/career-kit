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
    expect(screen.getByRole("link", { name: /Back to Upload/i })).toBeInTheDocument();
  });

  it("renders side-by-side provider results with scores and keywords", () => {
    const data = mockComparisonResult({
      results: {
        anthropic: mockOptimizationResult({ match_score: 78, summary: "Strong fit." }),
        openai: mockOptimizationResult({ match_score: 72, summary: "Good fit." }),
      },
      comparison: {
        score_delta: { anthropic: 78, openai: 72 },
        unique_keywords: { anthropic: ["Claude"], openai: ["GPT"] },
        processing_time_ms: { anthropic: 1200, openai: 800 },
      },
    });
    render(<ProviderComparison data={data} />);

    expect(screen.getAllByText("Claude").length).toBeGreaterThan(0);
    expect(screen.getAllByText("GPT-4o").length).toBeGreaterThan(0);
    expect(screen.getAllByText("78").length).toBeGreaterThan(0);
    expect(screen.getAllByText("72").length).toBeGreaterThan(0);
    const viewLinks = screen.getAllByRole("link", { name: /View full results/i });
    expect(viewLinks.length).toBeGreaterThan(0);
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
