/** Component tests for gap analysis ordering and content. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { GapAnalysis } from "@/components/ui/GapAnalysis";
import type { Gap } from "@/types/optimization";

describe("GapAnalysis", () => {
  it("renders gap skills and importance badges in accordion triggers", () => {
    const gaps: Gap[] = [
      {
        skill: "Kubernetes",
        importance: "preferred",
        suggestion: "Add one production deployment bullet.",
      },
    ];

    render(<GapAnalysis gaps={gaps} />);

    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
    expect(screen.getByText("Important")).toBeInTheDocument();
  });

  it("sorts by importance critical, preferred, nice to have", () => {
    const gaps: Gap[] = [
      { skill: "Docker", importance: "nice_to_have", suggestion: "Mention container use." },
      { skill: "System Design", importance: "critical", suggestion: "Add architecture examples." },
      { skill: "Kubernetes", importance: "preferred", suggestion: "Mention cluster usage." },
    ];

    render(<GapAnalysis gaps={gaps} />);
    const skills = screen.getAllByText(/Docker|System Design|Kubernetes/).map((el) => el.textContent);
    expect(skills).toEqual(["System Design", "Kubernetes", "Docker"]);
  });

  it("handles empty gaps array", () => {
    render(<GapAnalysis gaps={[]} />);
    expect(screen.getByText("Gap Analysis")).toBeInTheDocument();
  });
});
