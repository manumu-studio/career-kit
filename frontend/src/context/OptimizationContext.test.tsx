/** Tests for optimization context provider and hook usage. */
import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  OptimizationProvider,
  useOptimizationContext,
} from "@/context/OptimizationContext";
import { mockOptimizationResult } from "@/test/mocks";

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <OptimizationProvider>{children}</OptimizationProvider>;
}

describe("OptimizationContext", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("setResult stores result and clearResult resets to null", () => {
    const { result } = renderHook(() => useOptimizationContext(), { wrapper: Wrapper });
    const payload = mockOptimizationResult();

    act(() => {
      result.current.setResult(payload);
    });
    expect(result.current.result).toEqual(payload);

    act(() => {
      result.current.clearResult();
    });
    expect(result.current.result).toBeNull();
  });

  it("throws when used outside provider", () => {
    expect(() => renderHook(() => useOptimizationContext())).toThrow(
      "useOptimizationContext must be used within OptimizationProvider.",
    );
  });

  it("writes to sessionStorage after setting result", async () => {
    const { result } = renderHook(() => useOptimizationContext(), { wrapper: Wrapper });
    const payload = mockOptimizationResult();

    act(() => {
      result.current.setResult(payload);
    });

    await waitFor(() => {
      const stored = sessionStorage.getItem("optimization-result-v1");
      expect(stored).toBe(JSON.stringify(payload));
    });
  });

  it("hydrates from existing sessionStorage data on mount", async () => {
    const payload = mockOptimizationResult();
    sessionStorage.setItem("optimization-result-v1", JSON.stringify(payload));

    const { result } = renderHook(() => useOptimizationContext(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.result).toEqual(payload);
    });
  });
});
