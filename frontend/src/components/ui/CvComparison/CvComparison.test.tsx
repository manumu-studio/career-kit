/** Component tests for CV comparison section rendering. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CvComparison } from "@/components/ui/CvComparison";
import { mockCvSection } from "@/test/mocks";

describe("CvComparison", () => {
  it("renders headings, original and optimized content", () => {
    const section = mockCvSection();
    render(<CvComparison sections={[section]} />);

    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText(section.original)).toBeInTheDocument();
    expect(screen.getByText(section.optimized)).toBeInTheDocument();
  });

  it("renders changes made list items", () => {
    const section = mockCvSection();
    render(<CvComparison sections={[section]} />);
    for (const change of section.changes_made) {
      expect(screen.getByText(change)).toBeInTheDocument();
    }
  });

  it("handles empty sections without crashing", () => {
    render(<CvComparison sections={[]} />);
    expect(screen.getByText("CV Comparison")).toBeInTheDocument();
  });
});
