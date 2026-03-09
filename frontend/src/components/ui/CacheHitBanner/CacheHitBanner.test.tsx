/** Component tests for CacheHitBanner — shows when cached, hidden when not. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { CacheHitBanner } from "./CacheHitBanner";
import { mockCachedMatchInfo } from "@/test/mocks";

describe("CacheHitBanner", () => {
  const onUseCached = vi.fn();
  const onRunAgain = vi.fn();

  it("shows research variant message with company name", () => {
    const match = mockCachedMatchInfo({ company_name: "Acme Corp" });
    render(
      <CacheHitBanner
        variant="research"
        match={match}
        onUseCached={onUseCached}
        onRunAgain={onRunAgain}
      />,
    );

    expect(
      screen.getByText(/We already researched Acme Corp/),
    ).toBeInTheDocument();
  });

  it("shows optimization variant message", () => {
    const match = mockCachedMatchInfo({ company_name: "Beta Inc" });
    render(
      <CacheHitBanner
        variant="optimization"
        match={match}
        onUseCached={onUseCached}
        onRunAgain={onRunAgain}
      />,
    );

    expect(
      screen.getByText(/You optimized for this exact job description/),
    ).toBeInTheDocument();
  });

  it("renders Use Cached and Research Again for research variant", () => {
    const match = mockCachedMatchInfo();
    render(
      <CacheHitBanner
        variant="research"
        match={match}
        onUseCached={onUseCached}
        onRunAgain={onRunAgain}
      />,
    );

    expect(screen.getByRole("button", { name: "Use Cached" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Research Again" })).toBeInTheDocument();
  });

  it("renders View Previous and Optimize Again for optimization variant", () => {
    const match = mockCachedMatchInfo();
    render(
      <CacheHitBanner
        variant="optimization"
        match={match}
        onUseCached={onUseCached}
        onRunAgain={onRunAgain}
      />,
    );

    expect(screen.getByRole("button", { name: "View Previous" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Optimize Again" })).toBeInTheDocument();
  });

  it("calls onUseCached when primary button is clicked", async () => {
    const user = userEvent.setup();
    const match = mockCachedMatchInfo();
    render(
      <CacheHitBanner
        variant="research"
        match={match}
        onUseCached={onUseCached}
        onRunAgain={onRunAgain}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Use Cached" }));
    expect(onUseCached).toHaveBeenCalled();
  });

  it("calls onRunAgain when secondary button is clicked", async () => {
    const user = userEvent.setup();
    const match = mockCachedMatchInfo();
    render(
      <CacheHitBanner
        variant="research"
        match={match}
        onUseCached={onUseCached}
        onRunAgain={onRunAgain}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Research Again" }));
    expect(onRunAgain).toHaveBeenCalled();
  });
});
