/** Component tests for HistoryCard — date formatting, score badge, click handler. */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { HistoryCard } from "./HistoryCard";
import { mockHistoryEntry } from "@/test/mocks";

describe("HistoryCard", () => {
  const onView = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    onView.mockClear();
    onDelete.mockClear();
  });

  it("renders company name and job title", () => {
    const item = mockHistoryEntry({ company_name: "Acme Corp", job_title: "Software Engineer" });
    render(<HistoryCard item={item} onView={onView} onDelete={onDelete} />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("renders Unknown company when company_name is null", () => {
    const item = mockHistoryEntry({ company_name: null });
    render(<HistoryCard item={item} onView={onView} onDelete={onDelete} />);

    expect(screen.getByText("Unknown company")).toBeInTheDocument();
  });

  it("renders analysis type badge", () => {
    const item = mockHistoryEntry({ analysis_type: "optimize" });
    render(<HistoryCard item={item} onView={onView} onDelete={onDelete} />);

    expect(screen.getByText("Optimization")).toBeInTheDocument();
  });

  it("renders match score badge when present", () => {
    const item = mockHistoryEntry({ match_score: 75 });
    render(<HistoryCard item={item} onView={onView} onDelete={onDelete} />);

    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("renders Cached badge when cache_hit is true", () => {
    const item = mockHistoryEntry({ cache_hit: true });
    render(<HistoryCard item={item} onView={onView} onDelete={onDelete} />);

    expect(screen.getByText("Cached")).toBeInTheDocument();
  });

  it("formats date as Yesterday for item from yesterday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-16T12:00:00Z"));
    const item = mockHistoryEntry({ created_at: "2024-01-15T12:00:00Z" });
    render(<HistoryCard item={item} onView={onView} onDelete={onDelete} />);

    expect(screen.getByText(/Yesterday/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("calls onView when View button is clicked", async () => {
    const user = userEvent.setup();
    const item = mockHistoryEntry({ id: "hist-123" });
    render(<HistoryCard item={item} onView={onView} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "View" }));
    expect(onView).toHaveBeenCalledWith("hist-123");
  });

  it("calls onDelete when Delete button is clicked", async () => {
    const user = userEvent.setup();
    const item = mockHistoryEntry({ id: "hist-456" });
    render(<HistoryCard item={item} onView={onView} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("hist-456");
  });

  it("shows Deleting… and disables Delete when isDeleting is true", () => {
    const item = mockHistoryEntry();
    render(
      <HistoryCard item={item} onView={onView} onDelete={onDelete} isDeleting />,
    );

    expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  });
});
