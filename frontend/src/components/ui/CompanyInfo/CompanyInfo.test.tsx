/** Component tests for CompanyInfo — form fields, validation, submit. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { CompanyInfo } from "./CompanyInfo";

describe("CompanyInfo", () => {
  const onCompanyNameChange = vi.fn();
  const onHiringManagerChange = vi.fn();

  it("renders company name and hiring manager fields", () => {
    render(
      <CompanyInfo
        companyName=""
        hiringManager={null}
        onCompanyNameChange={onCompanyNameChange}
        onHiringManagerChange={onHiringManagerChange}
      />,
    );

    expect(screen.getByLabelText(/Company name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hiring manager name/)).toBeInTheDocument();
  });

  it("shows required indicator on company name", () => {
    render(
      <CompanyInfo
        companyName=""
        hiringManager={null}
        onCompanyNameChange={onCompanyNameChange}
        onHiringManagerChange={onHiringManagerChange}
      />,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays company name value", () => {
    render(
      <CompanyInfo
        companyName="Acme Inc"
        hiringManager={null}
        onCompanyNameChange={onCompanyNameChange}
        onHiringManagerChange={onHiringManagerChange}
      />,
    );

    expect(screen.getByDisplayValue("Acme Inc")).toBeInTheDocument();
  });

  it("calls onCompanyNameChange when company name changes", async () => {
    const user = userEvent.setup();
    render(
      <CompanyInfo
        companyName=""
        hiringManager={null}
        onCompanyNameChange={onCompanyNameChange}
        onHiringManagerChange={onHiringManagerChange}
      />,
    );

    await user.type(screen.getByLabelText(/Company name/), "Acme");
    expect(onCompanyNameChange).toHaveBeenCalled();
  });

  it("calls onHiringManagerChange when hiring manager changes", async () => {
    const user = userEvent.setup();
    render(
      <CompanyInfo
        companyName=""
        hiringManager={null}
        onCompanyNameChange={onCompanyNameChange}
        onHiringManagerChange={onHiringManagerChange}
      />,
    );

    await user.type(screen.getByLabelText(/Hiring manager name/), "Jane");
    expect(onHiringManagerChange).toHaveBeenCalled();
  });

  it("disables inputs when disabled prop is true", () => {
    render(
      <CompanyInfo
        companyName=""
        hiringManager={null}
        onCompanyNameChange={onCompanyNameChange}
        onHiringManagerChange={onHiringManagerChange}
        disabled
      />,
    );

    expect(screen.getByLabelText(/Company name/)).toBeDisabled();
    expect(screen.getByLabelText(/Hiring manager name/)).toBeDisabled();
  });
});
