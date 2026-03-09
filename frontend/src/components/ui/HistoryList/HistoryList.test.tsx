/** Component tests for HistoryList — list, empty state, search. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { HistoryList } from "./HistoryList";
import { mockHistoryEntry } from "@/test/mocks";

const defaultProps = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  companySearch: "",
  typeFilter: "all" as const,
  onCompanySearchChange: vi.fn(),
  onTypeFilterChange: vi.fn(),
  onPageChange: vi.fn(),
  onView: vi.fn(),
  onDelete: vi.fn(),
  deletingId: null as string | null,
  isLoading: false,
  error: null as string | null,
};

describe("HistoryList", () => {
  it("renders search input with placeholder", () => {
    render(<HistoryList {...defaultProps} />);
    expect(
      screen.getByRole("searchbox", { name: "Search by company name" }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search by company name..."),
    ).toBeInTheDocument();
  });

  it("renders filter chips All, Research, Optimization", () => {
    render(<HistoryList {...defaultProps} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Research" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Optimization" })).toBeInTheDocument();
  });

  it("shows empty state when items are empty and not loading", () => {
    render(<HistoryList {...defaultProps} />);
    expect(
      screen.getByText(
        "No analyses yet. Run company research or CV optimization to see your history.",
      ),
    ).toBeInTheDocument();
  });

  it("shows loading spinner when isLoading is true", () => {
    render(<HistoryList {...defaultProps} isLoading />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("shows error message when error is set", () => {
    render(<HistoryList {...defaultProps} error="Failed to load" />);
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("renders history cards when items are provided", () => {
    const items = [
      mockHistoryEntry({ id: "1", company_name: "Acme" }),
      mockHistoryEntry({ id: "2", company_name: "Beta Inc" }),
    ];
    render(
      <HistoryList
        {...defaultProps}
        items={items}
        total={2}
      />,
    );

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Beta Inc")).toBeInTheDocument();
  });

  it("calls onCompanySearchChange when typing in search", async () => {
    const user = userEvent.setup();
    const onCompanySearchChange = vi.fn();
    render(
      <HistoryList {...defaultProps} onCompanySearchChange={onCompanySearchChange} />,
    );

    await user.type(
      screen.getByRole("searchbox", { name: "Search by company name" }),
      "Acme",
    );
    expect(onCompanySearchChange).toHaveBeenCalled();
  });

  it("calls onTypeFilterChange when filter chip is clicked", async () => {
    const user = userEvent.setup();
    const onTypeFilterChange = vi.fn();
    render(
      <HistoryList {...defaultProps} onTypeFilterChange={onTypeFilterChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Research" }));
    expect(onTypeFilterChange).toHaveBeenCalledWith("research");
  });

  it("shows pagination when totalPages > 1", () => {
    const items = Array.from({ length: 25 }, (_, i) =>
      mockHistoryEntry({ id: `id-${i}`, company_name: `Company ${i}` }),
    );
    render(
      <HistoryList
        {...defaultProps}
        items={items}
        total={50}
        page={1}
      />,
    );

    expect(screen.getByText(/Page 1 of 3 \(50 total\)/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
  });
});
