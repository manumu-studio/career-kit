/** Component tests for score card rendering. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { ScoreCard } from "@/components/ui/ScoreCard";

describe("ScoreCard", () => {
  it("renders the provided score", () => {
    render(<ScoreCard score={75} />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("renders score label", () => {
    render(<ScoreCard score={50} />);
    expect(screen.getAllByText("Job Match").length).toBeGreaterThan(0);
  });

  it("clamps score to 0–100", () => {
    render(<ScoreCard score={150} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    render(<ScoreCard score={-10} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
