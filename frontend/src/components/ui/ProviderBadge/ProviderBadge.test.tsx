/** Component tests for ProviderBadge — provider name, icon/color. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { ProviderBadge } from "./ProviderBadge";

describe("ProviderBadge", () => {
  it("renders Claude for anthropic provider", () => {
    render(<ProviderBadge provider="anthropic" />);
    expect(screen.getByText("Claude")).toBeInTheDocument();
  });

  it("renders GPT-4o for openai provider", () => {
    render(<ProviderBadge provider="openai" />);
    expect(screen.getByText("GPT-4o")).toBeInTheDocument();
  });

  it("renders Gemini for gemini provider", () => {
    render(<ProviderBadge provider="gemini" />);
    expect(screen.getByText("Gemini")).toBeInTheDocument();
  });

  it("has title attribute with optimization context", () => {
    render(<ProviderBadge provider="anthropic" />);
    const badge = screen.getByTitle("Optimized with Claude");
    expect(badge).toBeInTheDocument();
  });
});
