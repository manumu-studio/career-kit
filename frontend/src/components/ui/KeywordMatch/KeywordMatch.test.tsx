/** Component tests for keyword match summary and styling. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { KeywordMatch } from "@/components/ui/KeywordMatch";

describe("KeywordMatch", () => {
  it("renders matched and missed keywords with count summary", () => {
    render(<KeywordMatch matches={["Python", "React"]} misses={["Kubernetes"]} />);

    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
    expect(screen.getByText("2 of 3 keywords matched")).toBeInTheDocument();
  });

  it("handles empty match and miss arrays", () => {
    render(<KeywordMatch matches={[]} misses={[]} />);
    expect(screen.getByText("0 of 0 keywords matched")).toBeInTheDocument();
  });

  it("applies distinct styling for matched and missed keyword tags", () => {
    render(<KeywordMatch matches={["Python"]} misses={["Kubernetes"]} />);

    const matchedTag = screen.getByText("Python");
    const missedTag = screen.getByText("Kubernetes");
    expect(matchedTag).toHaveClass("bg-emerald-500/15");
    expect(missedTag).toHaveClass("bg-rose-500/15");
  });
});
