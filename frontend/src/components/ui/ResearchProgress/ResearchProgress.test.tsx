/** Component tests for ResearchProgress — progress steps, current step. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { ResearchProgress } from "./ResearchProgress";

describe("ResearchProgress", () => {
  it("renders Research Progress heading", () => {
    render(<ResearchProgress currentStep="idle" />);
    expect(screen.getByRole("heading", { name: "Research Progress" })).toBeInTheDocument();
  });

  it("renders all step labels", () => {
    render(<ResearchProgress currentStep="scraping" />);

    expect(screen.getByText("Scraping website...")).toBeInTheDocument();
    expect(screen.getByText("Searching public sources...")).toBeInTheDocument();
    expect(screen.getByText("Analyzing with AI...")).toBeInTheDocument();
    expect(screen.getByText("Research complete")).toBeInTheDocument();
  });

  it("shows done state when currentStep is done", () => {
    render(<ResearchProgress currentStep="done" />);
    expect(screen.getByText("Research complete")).toBeInTheDocument();
  });

  it("shows error message when currentStep is error", () => {
    render(<ResearchProgress currentStep="error" />);
    expect(screen.getByText("Research failed. Please try again.")).toBeInTheDocument();
  });

  it("shows loading indicator for active step", () => {
    render(<ResearchProgress currentStep="analyzing" />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });
});
