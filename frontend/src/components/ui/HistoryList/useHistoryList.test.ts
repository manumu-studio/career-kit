/** Hook tests for useHistoryList — fetch, filters, pagination, delete. */
import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useHistoryList } from "./useHistoryList";

describe("useHistoryList", () => {
  it("fetches history list on mount", async () => {
    const { result } = renderHook(() => useHistoryList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.company_name).toBe("Acme Corp");
    expect(result.current.total).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it("returns initial typeFilter as all by default", async () => {
    const { result } = renderHook(() => useHistoryList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.typeFilter).toBe("all");
  });

  it("accepts initialTypeFilter option", async () => {
    const { result } = renderHook(() =>
      useHistoryList({ initialTypeFilter: "research" }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.typeFilter).toBe("research");
  });

  it("updates companySearch when setCompanySearch is called", async () => {
    const { result } = renderHook(() => useHistoryList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.setCompanySearch("Acme");
    });
    expect(result.current.companySearch).toBe("Acme");
  });

  it("updates typeFilter when setTypeFilter is called", async () => {
    const { result } = renderHook(() => useHistoryList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.setTypeFilter("optimize");
    });
    expect(result.current.typeFilter).toBe("optimize");
  });

  it("provides deleteItem function", async () => {
    const { result } = renderHook(() => useHistoryList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.deleteItem).toBe("function");
  });

  it("provides refresh function", async () => {
    const { result } = renderHook(() => useHistoryList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe("function");
  });
});
