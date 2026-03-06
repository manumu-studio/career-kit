"use client";

/** History detail page showing full research and/or optimization results. */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CvComparison } from "@/components/ui/CvComparison";
import { GapAnalysis } from "@/components/ui/GapAnalysis";
import { KeywordMatch } from "@/components/ui/KeywordMatch";
import { CompanyReport } from "@/components/ui/CompanyReport";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { useSession } from "@/features/auth";
import { fetchHistoryDetail } from "@/lib/api";
import type { CompanyResearchResult } from "@/types/company";
import type { OptimizationResult } from "@/types/optimization";
import type { HistoryDetailResponse } from "@/types/history";

function isCompanyResearchResult(value: unknown): value is CompanyResearchResult {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.profile === "object" &&
    typeof o.report === "object" &&
    Array.isArray(o.sources_used) &&
    typeof o.research_quality === "string" &&
    typeof o.researched_at === "string"
  );
}

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

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = typeof params.id === "string" ? params.id : null;

  const [detail, setDetail] = useState<HistoryDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistoryDetail(id, session?.user?.externalId);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis");
    } finally {
      setIsLoading(false);
    }
  }, [id, session?.user?.externalId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  if (!id) {
    router.replace("/history");
    return null;
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold text-white">Analysis not found</h1>
        <p className="text-slate-300">{error ?? "This analysis may have been deleted."}</p>
        <Link className="text-sky-300 underline" href="/history">
          ← Back to History
        </Link>
      </main>
    );
  }

  const companyResearch = detail.company_research_json
    ? (isCompanyResearchResult(detail.company_research_json)
        ? detail.company_research_json
        : null)
    : null;

  const optimizationResult = detail.optimization_result_json
    ? (isOptimizationResult(detail.optimization_result_json)
        ? detail.optimization_result_json
        : null)
    : null;

  const hasContent = companyResearch !== null || optimizationResult !== null;

  if (!hasContent) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold text-white">No results to display</h1>
        <p className="text-slate-300">This analysis has no stored research or optimization data.</p>
        <Link className="text-sky-300 underline" href="/history">
          ← Back to History
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {detail.company_name ?? "Analysis"} {detail.job_title ? `— ${detail.job_title}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {new Date(detail.created_at).toLocaleString()}
            {detail.cache_hit ? (
              <span className="ml-2 rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                Loaded from cache
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2">
          {optimizationResult ? (
            <Link
              className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
              href={`/history/compare?a=${id}`}
            >
              Compare with another
            </Link>
          ) : null}
          <Link
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            href="/history"
          >
            ← Back to History
          </Link>
        </div>
      </header>

      {companyResearch ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Company Research</h2>
          <CompanyReport research={companyResearch} />
        </section>
      ) : null}

      {optimizationResult ? (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-100">CV Optimization</h2>
          <p className="text-slate-300">{optimizationResult.summary}</p>
          <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="space-y-8">
              <ScoreCard score={optimizationResult.match_score} />
              <KeywordMatch
                matches={optimizationResult.keyword_matches}
                misses={optimizationResult.keyword_misses}
              />
              <GapAnalysis gaps={optimizationResult.gap_analysis} />
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <CvComparison sections={optimizationResult.sections} />
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
