"use client";

/** Hook to run provider comparison and manage loading/error state. */
import { useCallback, useState } from "react";
import { compareProviders } from "@/lib/api";
import type { ComparisonResult } from "@/types/provider";

export function useProviderComparison() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const runComparison = useCallback(
    async (cvFile: File, jobDescription: string, providers: string[]) => {
      setError(null);
      setResult(null);
      setLoading(true);
      try {
        const data = await compareProviders(cvFile, jobDescription, providers);
        setResult(data);
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Comparison failed";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { runComparison, loading, error, result };
}
