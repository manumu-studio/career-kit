/** Hook tests for useProviderSelector — providers, selection, persistence. */
import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useProviderSelector } from "./useProviderSelector";

describe("useProviderSelector", () => {
  it("fetches providers and sets available list", async () => {
    const { result } = renderHook(() => useProviderSelector());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.available).toContain("anthropic");
    expect(result.current.available).toContain("openai");
    expect(result.current.available).toContain("gemini");
    expect(result.current.selected).toBeDefined();
  });

  it("returns defaultProvider from API", async () => {
    const { result } = renderHook(() => useProviderSelector());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.defaultProvider).toBe("anthropic");
  });

  it("provides onChange function", async () => {
    const { result } = renderHook(() => useProviderSelector());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.onChange).toBe("function");
  });

  it("updates selected when onChange is called", async () => {
    const { result } = renderHook(() => useProviderSelector());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.onChange("openai");
    });
    expect(result.current.selected).toBe("openai");
  });

  it("persists selection to localStorage", async () => {
    const { result } = renderHook(() => useProviderSelector());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.onChange("gemini");
    });
    expect(localStorage.getItem("ats-provider-preference")).toBe("gemini");
  });
});
