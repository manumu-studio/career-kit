/** Component tests for ProviderSelector — providers, selection, disabled states. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { ProviderSelector } from "./ProviderSelector";

describe("ProviderSelector", () => {
  it("renders AI Provider label", () => {
    render(
      <ProviderSelector
        value="anthropic"
        onChange={() => {}}
        available={["anthropic", "openai"]}
        defaultProvider="anthropic"
      />,
    );
    expect(screen.getByText("AI Provider")).toBeInTheDocument();
  });

  it("renders provider options", () => {
    render(
      <ProviderSelector
        value="anthropic"
        onChange={() => {}}
        available={["anthropic", "openai"]}
        defaultProvider="anthropic"
      />,
    );
    const combobox = screen.getByRole("combobox", { name: "Select AI provider" });
    expect(combobox).toHaveTextContent("anthropic");
  });

  it("calls onChange when selection changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProviderSelector
        value="anthropic"
        onChange={onChange}
        available={["anthropic", "openai"]}
        defaultProvider="anthropic"
      />,
    );
    const combobox = screen.getByRole("combobox", { name: "Select AI provider" });
    await user.click(combobox);
    const openaiOption = await screen.findByText(/GPT-4o/);
    await user.click(openaiOption);
    expect(onChange).toHaveBeenCalledWith("openai");
  });

  it("uses defaultProvider when value is null", () => {
    render(
      <ProviderSelector
        value={null}
        onChange={() => {}}
        available={["anthropic"]}
        defaultProvider="openai"
      />,
    );
    const combobox = screen.getByRole("combobox", { name: "Select AI provider" });
    expect(combobox).toHaveTextContent("openai");
  });

  it("disables select when disabled prop is true", () => {
    render(
      <ProviderSelector
        value="anthropic"
        onChange={() => {}}
        available={["anthropic"]}
        defaultProvider="anthropic"
        disabled
      />,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
