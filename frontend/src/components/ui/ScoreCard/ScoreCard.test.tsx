/** Component tests for score card rendering and thresholds. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreCard } from "@/components/ui/ScoreCard";

describe("ScoreCard", () => {
  it("renders the provided score", () => {
    render(<ScoreCard score={75} />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("renders low score label and red class", () => {
    render(<ScoreCard score={20} />);
    const label = screen.getByText("Low Match");
    expect(label).toHaveClass("text-rose-400");
  });

  it("renders moderate score label and amber class", () => {
    render(<ScoreCard score={55} />);
    const label = screen.getByText("Moderate Match");
    expect(label).toHaveClass("text-amber-400");
  });

  it("renders strong score label and green class", () => {
    render(<ScoreCard score={85} />);
    const label = screen.getByText("Strong Match");
    expect(label).toHaveClass("text-emerald-400");
  });

  it("handles boundary thresholds", () => {
    const { rerender } = render(<ScoreCard score={0} />);
    expect(screen.getByText("Low Match")).toBeInTheDocument();
    rerender(<ScoreCard score={39} />);
    expect(screen.getByText("Low Match")).toBeInTheDocument();
    rerender(<ScoreCard score={40} />);
    expect(screen.getByText("Moderate Match")).toBeInTheDocument();
    rerender(<ScoreCard score={69} />);
    expect(screen.getByText("Moderate Match")).toBeInTheDocument();
    rerender(<ScoreCard score={70} />);
    expect(screen.getByText("Strong Match")).toBeInTheDocument();
    rerender(<ScoreCard score={100} />);
    expect(screen.getByText("Strong Match")).toBeInTheDocument();
  });
});
