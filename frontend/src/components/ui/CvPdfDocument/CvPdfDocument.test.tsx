/** Smoke tests for CvPdfDocument — react-pdf cannot render in jsdom, verify props accepted. */
import { describe, expect, it, vi } from "vitest";
import { render } from "@/test/utils";
import { CvPdfDocument } from "./CvPdfDocument";
import { mockOptimizationResult } from "@/test/mocks";

vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-document">{children}</div>
  ),
  Page: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-page">{children}</div>
  ),
  Text: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="pdf-text">{children}</span>
  ),
  View: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-view">{children}</div>
  ),
}));

describe("CvPdfDocument", () => {
  it("accepts optimizationResult prop and renders without error", () => {
    const optimizationResult = mockOptimizationResult();
    const { container } = render(
      <CvPdfDocument optimizationResult={optimizationResult} />,
    );

    expect(container.querySelector("[data-testid='pdf-document']")).toBeInTheDocument();
  });

  it("renders section headings from optimization result", () => {
    const optimizationResult = mockOptimizationResult({
      sections: [
        { heading: "Experience", original: "x", optimized: "y", changes_made: [] },
        { heading: "Education", original: "a", optimized: "b", changes_made: [] },
      ],
    });
    const { container } = render(
      <CvPdfDocument optimizationResult={optimizationResult} />,
    );

    expect(container).toHaveTextContent("Experience");
    expect(container).toHaveTextContent("Education");
  });
});
