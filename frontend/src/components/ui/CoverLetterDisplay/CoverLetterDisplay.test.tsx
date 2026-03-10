/** Component tests for CoverLetterDisplay — paragraphs, selling points, word count, empty state. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { CoverLetterDisplay } from "./CoverLetterDisplay";
import { mockCoverLetterResult } from "@/test/mocks";

describe("CoverLetterDisplay", () => {
  it("renders greeting, paragraphs, and sign-off", () => {
    const coverLetter = mockCoverLetterResult();
    render(<CoverLetterDisplay coverLetter={coverLetter} />);

    expect(screen.getByText(coverLetter.greeting)).toBeInTheDocument();
    expect(screen.getByText(coverLetter.opening_paragraph)).toBeInTheDocument();
    expect(screen.getByText(coverLetter.closing_paragraph)).toBeInTheDocument();
    expect(screen.getByText(coverLetter.sign_off)).toBeInTheDocument();
  });

  it("renders body paragraphs", () => {
    const coverLetter = mockCoverLetterResult({
      body_paragraphs: ["First body para.", "Second body para."],
    });
    render(<CoverLetterDisplay coverLetter={coverLetter} />);

    expect(screen.getByText("First body para.")).toBeInTheDocument();
    expect(screen.getByText("Second body para.")).toBeInTheDocument();
  });

  it("renders key selling points when present", () => {
    const coverLetter = mockCoverLetterResult({
      key_selling_points: ["5+ years Python", "FastAPI experience"],
    });
    render(<CoverLetterDisplay coverLetter={coverLetter} />);

    expect(screen.getByText("Key Selling Points")).toBeInTheDocument();
    expect(screen.getByText("5+ years Python")).toBeInTheDocument();
    expect(screen.getByText("FastAPI experience")).toBeInTheDocument();
  });

  it("hides selling points section when empty", () => {
    const coverLetter = mockCoverLetterResult({ key_selling_points: [] });
    render(<CoverLetterDisplay coverLetter={coverLetter} />);

    expect(screen.queryByText("Key Selling Points")).not.toBeInTheDocument();
  });

  it("renders word count and tone", () => {
    const coverLetter = mockCoverLetterResult({ word_count: 250, tone_used: "enthusiastic" });
    render(<CoverLetterDisplay coverLetter={coverLetter} />);

    expect(screen.getByText("250 words")).toBeInTheDocument();
    expect(screen.getByText("enthusiastic")).toBeInTheDocument();
  });

  it("renders Cover Letter heading", () => {
    const coverLetter = mockCoverLetterResult();
    render(<CoverLetterDisplay coverLetter={coverLetter} />);

    expect(screen.getByRole("heading", { name: "Cover Letter" })).toBeInTheDocument();
  });
});
