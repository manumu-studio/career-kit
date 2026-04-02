/** Tests for CompareProvidersPanel — checkboxes and compare action. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { CompareProvidersPanel } from "./CompareProvidersPanel";

describe("CompareProvidersPanel", () => {
  it("renders compare description and provider labels", () => {
    render(
      <CompareProvidersPanel
        availableProviders={["anthropic", "openai", "gemini"]}
        selectedProviders={new Set()}
        onToggle={vi.fn()}
        onCompare={vi.fn()}
        isComparing={false}
        isReadyToSubmit
      />,
    );
    expect(
      screen.getByText("Run the same CV + JD through 2+ providers and compare results."),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /anthropic/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /openai/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /gemini/i })).toBeInTheDocument();
  });

  it("disables checkboxes for providers not in availableProviders", () => {
    render(
      <CompareProvidersPanel
        availableProviders={["anthropic"]}
        selectedProviders={new Set()}
        onToggle={vi.fn()}
        onCompare={vi.fn()}
        isComparing={false}
        isReadyToSubmit
      />,
    );
    expect(screen.getByRole("checkbox", { name: /anthropic/i })).not.toBeDisabled();
    expect(screen.getByRole("checkbox", { name: /openai/i })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: /gemini/i })).toBeDisabled();
  });

  it("calls onToggle when a checkbox changes", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <CompareProvidersPanel
        availableProviders={["anthropic", "openai"]}
        selectedProviders={new Set()}
        onToggle={onToggle}
        onCompare={vi.fn()}
        isComparing={false}
        isReadyToSubmit
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: /anthropic/i }));
    expect(onToggle).toHaveBeenCalledWith("anthropic");
  });

  it("disables compare button until two providers are selected", () => {
    render(
      <CompareProvidersPanel
        availableProviders={["anthropic", "openai", "gemini"]}
        selectedProviders={new Set(["anthropic"])}
        onToggle={vi.fn()}
        onCompare={vi.fn()}
        isComparing={false}
        isReadyToSubmit
      />,
    );
    expect(screen.getByRole("button", { name: /Run comparison/i })).toBeDisabled();
  });

  it("enables compare button when two providers selected and calls onCompare", async () => {
    const user = userEvent.setup();
    const onCompare = vi.fn();
    render(
      <CompareProvidersPanel
        availableProviders={["anthropic", "openai"]}
        selectedProviders={new Set(["anthropic", "openai"])}
        onToggle={vi.fn()}
        onCompare={onCompare}
        isComparing={false}
        isReadyToSubmit
      />,
    );
    const btn = screen.getByRole("button", { name: /Run comparison/i });
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    expect(onCompare).toHaveBeenCalledOnce();
  });

  it("shows comparing label when isComparing is true", () => {
    render(
      <CompareProvidersPanel
        availableProviders={["anthropic", "openai"]}
        selectedProviders={new Set(["anthropic", "openai"])}
        onToggle={vi.fn()}
        onCompare={vi.fn()}
        isComparing
        isReadyToSubmit
      />,
    );
    expect(screen.getByRole("button", { name: /Comparing/i })).toBeDisabled();
  });
});
