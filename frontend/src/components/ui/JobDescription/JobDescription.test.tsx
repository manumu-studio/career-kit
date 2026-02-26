/** Component tests for job description textarea behavior. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobDescription } from "@/components/ui/JobDescription";

describe("JobDescription", () => {
  it("renders textarea with provided value", () => {
    const onChange = vi.fn();
    render(<JobDescription onChange={onChange} value="Backend role details" />);
    expect(screen.getByDisplayValue("Backend role details")).toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<JobDescription onChange={onChange} value="" />);
    const textarea = screen.getByPlaceholderText("Paste the job description here...");

    await user.type(textarea, "Python");

    expect(onChange).toHaveBeenCalled();
  });

  it("shows character count", () => {
    const onChange = vi.fn();
    render(<JobDescription onChange={onChange} value="abc" />);
    expect(screen.getByText("3 characters")).toBeInTheDocument();
  });
});
