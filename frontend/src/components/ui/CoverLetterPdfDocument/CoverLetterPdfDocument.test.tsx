/** Smoke tests for CoverLetterPdfDocument — react-pdf cannot render in jsdom, verify props accepted. */
import { describe, expect, it, vi } from "vitest";
import { render } from "@/test/utils";
import { CoverLetterPdfDocument } from "./CoverLetterPdfDocument";
import { mockCoverLetterResult } from "@/test/mocks";

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
}));

describe("CoverLetterPdfDocument", () => {
  it("accepts coverLetter prop and renders without error", () => {
    const coverLetter = mockCoverLetterResult();
    const { container } = render(
      <CoverLetterPdfDocument coverLetter={coverLetter} />,
    );

    expect(container.querySelector("[data-testid='pdf-document']")).toBeInTheDocument();
  });

  it("renders greeting and opening paragraph from cover letter", () => {
    const coverLetter = mockCoverLetterResult({
      greeting: "Dear Hiring Manager,",
      opening_paragraph: "I am excited to apply.",
    });
    const { container } = render(
      <CoverLetterPdfDocument coverLetter={coverLetter} />,
    );

    expect(container).toHaveTextContent("Dear Hiring Manager,");
    expect(container).toHaveTextContent("I am excited to apply.");
  });
});
