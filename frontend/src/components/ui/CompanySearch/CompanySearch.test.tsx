/** Component tests for CompanySearch — input, submit, loading. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { CompanySearch } from "./CompanySearch";

describe("CompanySearch", () => {
  const onResearchComplete = vi.fn();
  const onResearchError = vi.fn();

  it("renders form fields", () => {
    render(
      <CompanySearch
        onResearchComplete={onResearchComplete}
        onResearchError={onResearchError}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Company Name" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Company Website URL" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Job Title" })).toBeInTheDocument();
  });

  it("disables Research button when company name is empty", () => {
    render(
      <CompanySearch
        onResearchComplete={onResearchComplete}
        onResearchError={onResearchError}
      />,
    );

    expect(screen.getByRole("button", { name: "Research Company" })).toBeDisabled();
  });

  it("enables Research button when company name is filled", async () => {
    const user = userEvent.setup();
    render(
      <CompanySearch
        onResearchComplete={onResearchComplete}
        onResearchError={onResearchError}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: "Company Name" }), "Acme");
    expect(screen.getByRole("button", { name: "Research Company" })).not.toBeDisabled();
  });

  it("shows Research Progress when research completes", async () => {
    const user = userEvent.setup();
    render(
      <CompanySearch
        onResearchComplete={onResearchComplete}
        onResearchError={onResearchError}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: "Company Name" }), "Acme");
    await user.click(screen.getByRole("button", { name: "Research Company" }));

    await screen.findByText("Acme Corp", {}, { timeout: 3000 });
    expect(onResearchComplete).toHaveBeenCalled();
  });
});
