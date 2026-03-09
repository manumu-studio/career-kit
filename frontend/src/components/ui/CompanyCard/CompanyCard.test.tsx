/** Component tests for CompanyCard — company name, summary, click. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { CompanyCard } from "./CompanyCard";
import type { CompanyResearchResult } from "@/types/company";
import { mockCompanyResearchResult } from "@/test/mocks";

describe("CompanyCard", () => {
  const onViewFullReport = vi.fn();

  it("renders company name and industry", () => {
    const result = mockCompanyResearchResult({
      profile: { name: "Acme Corp", industry: "Technology", size_estimate: "100-500" },
    } as Partial<CompanyResearchResult>);
    render(
      <CompanyCard
        profile={result.profile}
        researchQuality="high"
        onViewFullReport={onViewFullReport}
      />,
    );

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Technology • 100-500")).toBeInTheDocument();
  });

  it("renders research quality badge", () => {
    const result = mockCompanyResearchResult();
    render(
      <CompanyCard
        profile={result.profile}
        researchQuality="high"
        onViewFullReport={onViewFullReport}
      />,
    );

    expect(screen.getByText("high quality")).toBeInTheDocument();
  });

  it("renders core values chips", () => {
    const result = mockCompanyResearchResult({
      profile: { core_values: ["Innovation", "Quality", "Speed"] },
    } as Partial<CompanyResearchResult>);
    render(
      <CompanyCard
        profile={result.profile}
        researchQuality="high"
        onViewFullReport={onViewFullReport}
      />,
    );

    expect(screen.getByText("Innovation")).toBeInTheDocument();
    expect(screen.getByText("Quality")).toBeInTheDocument();
    expect(screen.getByText("Speed")).toBeInTheDocument();
  });

  it("renders employee sentiment", () => {
    const result = mockCompanyResearchResult({
      profile: {
        employee_sentiment: { overall: "positive", pros: [], cons: [], summary: "" },
      },
    } as unknown as Partial<CompanyResearchResult>);
    render(
      <CompanyCard
        profile={result.profile}
        researchQuality="high"
        onViewFullReport={onViewFullReport}
      />,
    );

    expect(screen.getByText("Employee sentiment")).toBeInTheDocument();
    expect(screen.getByText("positive")).toBeInTheDocument();
  });

  it("calls onViewFullReport when View Full Report is clicked", async () => {
    const user = userEvent.setup();
    const result = mockCompanyResearchResult();
    render(
      <CompanyCard
        profile={result.profile}
        researchQuality="high"
        onViewFullReport={onViewFullReport}
      />,
    );

    await user.click(screen.getByRole("button", { name: "View Full Report →" }));
    expect(onViewFullReport).toHaveBeenCalled();
  });
});
