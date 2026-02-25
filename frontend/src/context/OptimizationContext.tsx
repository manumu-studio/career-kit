"use client";

/** Stores the latest optimization response for cross-page access. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { OptimizationResult } from "@/types/optimization";

const STORAGE_KEY = "optimization-result-v1";

interface OptimizationContextValue {
  result: OptimizationResult | null;
  setResult: (result: OptimizationResult) => void;
  clearResult: () => void;
}

const OptimizationContext = createContext<OptimizationContextValue | undefined>(undefined);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isOptimizationResult(value: unknown): value is OptimizationResult {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.summary === "string" &&
    typeof value.match_score === "number" &&
    isStringArray(value.keyword_matches) &&
    isStringArray(value.keyword_misses) &&
    Array.isArray(value.sections) &&
    Array.isArray(value.gap_analysis)
  );
}

export function OptimizationProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [result, setResultState] = useState<OptimizationResult | null>(null);

  // Hydrate latest result from session storage after initial mount.
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed: unknown = JSON.parse(stored);
      if (isOptimizationResult(parsed)) {
        setResultState(parsed);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (result) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      return;
    }

    sessionStorage.removeItem(STORAGE_KEY);
  }, [result]);

  const setResult = useCallback((nextResult: OptimizationResult): void => {
    setResultState(nextResult);
  }, []);

  const clearResult = useCallback((): void => {
    setResultState(null);
  }, []);

  const value = useMemo(
    () => ({
      result,
      setResult,
      clearResult,
    }),
    [clearResult, result, setResult],
  );

  return <OptimizationContext.Provider value={value}>{children}</OptimizationContext.Provider>;
}

export function useOptimizationContext(): OptimizationContextValue {
  const context = useContext(OptimizationContext);
  if (!context) {
    throw new Error("useOptimizationContext must be used within OptimizationProvider.");
  }

  return context;
}
