"use client";

/** Compare two optimization results side-by-side. */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ComparisonView } from "@/components/ui/ComparisonView";
import { useSession } from "@/features/auth";
import { fetchHistoryDetail } from "@/lib/api";
import type { OptimizationResult } from "@/types/optimization";

function isOptimizationResult(value: unknown): value is OptimizationResult {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    Array.isArray(o.sections) &&
    Array.isArray(o.gap_analysis) &&
    Array.isArray(o.keyword_matches) &&
    Array.isArray(o.keyword_misses) &&
    typeof o.match_score === "number" &&
    typeof o.summary === "string"
  );
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");

  const [resultA, setResultA] = useState<OptimizationResult | null>(null);
  const [resultB, setResultB] = useState<OptimizationResult | null>(null);
  const [labelA, setLabelA] = useState<string>("Version A");
  const [labelB, setLabelB] = useState<string>("Version B");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBoth = useCallback(async () => {
    if (!idA || !idB) {
      setError(
        "Provide two analysis IDs in the URL: /history/compare?a=id1&b=id2. You can copy IDs from the History page.",
      );
      setIsLoading(false);
      return;
    }
    if (idA === idB) {
      setError("Select two different analyses to compare.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [detailA, detailB] = await Promise.all([
        fetchHistoryDetail(idA, session?.user?.externalId),
        fetchHistoryDetail(idB, session?.user?.externalId),
      ]);

      const optA = detailA.optimization_result_json;
      const optB = detailB.optimization_result_json;

      if (!optA || !isOptimizationResult(optA)) {
        setError("Analysis A has no optimization data.");
        return;
      }
      if (!optB || !isOptimizationResult(optB)) {
        setError("Analysis B has no optimization data.");
        return;
      }

      setResultA(optA);
      setResultB(optB);
      setLabelA(
        detailA.company_name && detailA.job_title
          ? `${detailA.company_name} — ${detailA.job_title}`
          : detailA.company_name ?? "Version A",
      );
      setLabelB(
        detailB.company_name && detailB.job_title
          ? `${detailB.company_name} — ${detailB.job_title}`
          : detailB.company_name ?? "Version B",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analyses.");
    } finally {
      setIsLoading(false);
    }
  }, [idA, idB, session?.user?.externalId]);

  useEffect(() => {
    void loadBoth();
  }, [loadBoth]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
      </main>
    );
  }

  if (error || !resultA || !resultB) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold text-white">Compare optimizations</h1>
        <p className="text-slate-300">{error ?? "Could not load both analyses."}</p>
        <Link className="text-sky-300 underline" href="/history">
          ← Back to History
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Compare optimizations</h1>
          <p className="mt-1 text-slate-400">
            Side-by-side view of two CV optimization results for the same job description.
          </p>
        </div>
        <Link
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
          href="/history"
        >
          ← Back to History
        </Link>
      </header>

      <ComparisonView
        labelA={labelA}
        labelB={labelB}
        resultA={resultA}
        resultB={resultB}
      />
    </main>
  );
}
