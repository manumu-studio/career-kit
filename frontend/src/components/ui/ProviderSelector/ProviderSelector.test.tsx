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

  it("renders provider options as pills", () => {
    render(
      <ProviderSelector
        value="anthropic"
        onChange={() => {}}
        available={["anthropic", "openai"]}
        defaultProvider="anthropic"
      />,
    );
    const anthropicButton = screen.getByRole("button", { name: /Claude \(Haiku\)/ });
    expect(anthropicButton).toBeInTheDocument();
    expect(anthropicButton).toHaveAttribute("aria-pressed", "true");
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
    const openaiButton = screen.getByRole("button", { name: /GPT-4o/ });
    await user.click(openaiButton);
    expect(onChange).toHaveBeenCalledWith("openai");
  });

  it("uses defaultProvider when value is null", () => {
    render(
      <ProviderSelector
        value={null}
        onChange={() => {}}
        available={["anthropic", "openai"]}
        defaultProvider="openai"
      />,
    );
    const openaiButton = screen.getByRole("button", { name: /GPT-4o/ });
    expect(openaiButton).toHaveAttribute("aria-pressed", "true");
  });

  it("disables buttons when disabled prop is true", () => {
    render(
      <ProviderSelector
        value="anthropic"
        onChange={() => {}}
        available={["anthropic"]}
        defaultProvider="anthropic"
        disabled
      />,
    );
    const anthropicButton = screen.getByRole("button", { name: /Claude \(Haiku\)/ });
    expect(anthropicButton).toBeDisabled();
  });
});
