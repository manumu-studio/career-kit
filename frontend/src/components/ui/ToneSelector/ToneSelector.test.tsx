/** Component tests for ToneSelector — options, selection, active state. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { ToneSelector } from "./ToneSelector";

describe("ToneSelector", () => {
  const onChange = vi.fn();

  it("renders Tone label and all options", () => {
    render(
      <ToneSelector value="professional" onChange={onChange} />,
    );

    expect(screen.getByText("Tone")).toBeInTheDocument();
    expect(screen.getByLabelText("Professional")).toBeInTheDocument();
    expect(screen.getByLabelText("Conversational")).toBeInTheDocument();
    expect(screen.getByLabelText("Enthusiastic")).toBeInTheDocument();
  });

  it("shows professional as checked when value is professional", () => {
    render(
      <ToneSelector value="professional" onChange={onChange} />,
    );

    expect(screen.getByRole("radio", { name: "Professional" })).toBeChecked();
  });

  it("calls onChange when option is selected", async () => {
    const user = userEvent.setup();
    render(
      <ToneSelector value="professional" onChange={onChange} />,
    );

    await user.click(screen.getByLabelText("Enthusiastic"));
    expect(onChange).toHaveBeenCalledWith("enthusiastic");
  });

  it("disables all radios when disabled", () => {
    render(
      <ToneSelector value="professional" onChange={onChange} disabled />,
    );

    expect(screen.getByRole("radio", { name: "Professional" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Conversational" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Enthusiastic" })).toBeDisabled();
  });
});
