/** Component tests for ExportToolbar — download buttons, cover letter disabled when no CL. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { ExportToolbar } from "./ExportToolbar";
import { mockCoverLetterResult, mockOptimizationResult } from "@/test/mocks";

describe("ExportToolbar", () => {
  it("renders Download CV (PDF) button", () => {
    render(
      <ExportToolbar
        optimizationResult={mockOptimizationResult()}
        coverLetter={null}
      />,
    );

    expect(screen.getByRole("button", { name: "Download optimized CV as PDF" })).toBeInTheDocument();
  });

  it("renders Download Cover Letter (PDF) button", () => {
    render(
      <ExportToolbar
        optimizationResult={mockOptimizationResult()}
        coverLetter={mockCoverLetterResult()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Download cover letter as PDF" }),
    ).toBeInTheDocument();
  });

  it("disables cover letter button when coverLetter is null", () => {
    render(
      <ExportToolbar
        optimizationResult={mockOptimizationResult()}
        coverLetter={null}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Download cover letter as PDF" }),
    ).toBeDisabled();
  });

  it("enables cover letter button when coverLetter is provided", () => {
    render(
      <ExportToolbar
        optimizationResult={mockOptimizationResult()}
        coverLetter={mockCoverLetterResult()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Download cover letter as PDF" }),
    ).not.toBeDisabled();
  });

  it("enables CV button", () => {
    render(
      <ExportToolbar
        optimizationResult={mockOptimizationResult()}
        coverLetter={null}
      />,
    );

    expect(screen.getByRole("button", { name: "Download optimized CV as PDF" })).not.toBeDisabled();
  });
});
