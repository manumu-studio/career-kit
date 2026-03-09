/** Component tests for KeywordChips — chips, color coding. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { KeywordChips } from "./KeywordChips";

describe("KeywordChips", () => {
  it("renders default label Keywords to Mirror", () => {
    render(<KeywordChips keywords={["Python", "FastAPI"]} />);
    expect(screen.getByRole("heading", { name: "Keywords to Mirror" })).toBeInTheDocument();
  });

  it("renders custom label when provided", () => {
    render(
      <KeywordChips keywords={[]} label="Key phrases" />,
    );
    expect(screen.getByRole("heading", { name: "Key phrases" })).toBeInTheDocument();
  });

  it("renders keyword chips", () => {
    render(<KeywordChips keywords={["Python", "FastAPI", "React"]} />);
    expect(screen.getByRole("button", { name: /Python/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /FastAPI/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /React/ })).toBeInTheDocument();
  });

  it("shows Copy on each chip", () => {
    render(<KeywordChips keywords={["Python"]} />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("calls copy handler when chip is clicked", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<KeywordChips keywords={["Python"]} />);
    await user.click(screen.getByRole("button", { name: /Python/ }));

    expect(writeText).toHaveBeenCalledWith("Python");
  });
});
