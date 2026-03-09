/** Component tests for CompanyReport — sections, confidence. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { CompanyReport } from "./CompanyReport";
import type { CompanyResearchResult } from "@/types/company";
import { mockCompanyResearchResult } from "@/test/mocks";

describe("CompanyReport", () => {
  it("renders company name and research quality", () => {
    const research = mockCompanyResearchResult({
      profile: { name: "Acme Corp", industry: "Tech", size_estimate: "50-200" },
      research_quality: "high",
    } as Partial<CompanyResearchResult>);
    render(<CompanyReport research={research} />);

    expect(screen.getByRole("heading", { name: "Acme Corp" })).toBeInTheDocument();
    expect(screen.getByText("Tech • 50-200")).toBeInTheDocument();
    expect(screen.getByText("Research quality: high")).toBeInTheDocument();
  });

  it("renders Executive Summary section", () => {
    const research = mockCompanyResearchResult({
      report: { executive_summary: "Tech company focused on innovation." },
    } as Partial<CompanyResearchResult>);
    render(<CompanyReport research={research} />);

    expect(screen.getByRole("heading", { name: "Executive Summary" })).toBeInTheDocument();
    expect(screen.getByText("Tech company focused on innovation.")).toBeInTheDocument();
  });

  it("renders Culture & Values section", () => {
    const research = mockCompanyResearchResult({
      report: { culture_and_values: "Collaborative and fast-paced." },
      profile: { core_values: ["Innovation", "Quality"] },
    } as Partial<CompanyResearchResult>);
    render(<CompanyReport research={research} />);

    expect(screen.getByRole("heading", { name: "Culture & Values" })).toBeInTheDocument();
    expect(screen.getByText("Collaborative and fast-paced.")).toBeInTheDocument();
    expect(screen.getByText("Innovation")).toBeInTheDocument();
    expect(screen.getByText("Quality")).toBeInTheDocument();
  });

  it("renders What They Look For section", () => {
    const research = mockCompanyResearchResult({
      report: { what_they_look_for: "Strong engineering skills." },
    } as Partial<CompanyResearchResult>);
    render(<CompanyReport research={research} />);

    expect(screen.getByRole("heading", { name: "What They Look For" })).toBeInTheDocument();
    expect(screen.getByText("Strong engineering skills.")).toBeInTheDocument();
  });

  it("renders Interview Preparation section", () => {
    const research = mockCompanyResearchResult({
      report: { interview_preparation: "Review system design." },
    } as Partial<CompanyResearchResult>);
    render(<CompanyReport research={research} />);

    expect(screen.getByRole("heading", { name: "Interview Preparation" })).toBeInTheDocument();
    expect(screen.getByText("Review system design.")).toBeInTheDocument();
  });

  it("renders Keywords to Mirror via KeywordChips", () => {
    const research = mockCompanyResearchResult({
      report: { keywords_to_mirror: ["Python", "FastAPI"] },
    } as Partial<CompanyResearchResult>);
    render(<CompanyReport research={research} />);

    expect(screen.getByRole("heading", { name: "Keywords to Mirror" })).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("FastAPI")).toBeInTheDocument();
  });
});
