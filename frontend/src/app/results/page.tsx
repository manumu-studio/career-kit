"use client";

/** Results page showing ATS score, comparison details, keywords, and gaps. */
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CvComparison } from "@/components/ui/CvComparison";
import { GapAnalysis } from "@/components/ui/GapAnalysis";
import { KeywordMatch } from "@/components/ui/KeywordMatch";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { useOptimizationContext } from "@/context/OptimizationContext";

export default function ResultsPage() {
  const router = useRouter();
  const { result } = useOptimizationContext();

  // Keep users on the upload route when there is no optimization payload.
  useEffect(() => {
    if (!result) {
      router.replace("/");
    }
  }, [result, router]);

  if (!result) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:py-12">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-white">Optimization Results</h1>
          <p className="text-sm text-slate-400">Your ATS-tailored CV improvements are ready.</p>
        </div>
        <Link
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
          href="/"
        >
          Back to Upload
        </Link>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="text-sm leading-relaxed text-slate-200">{result.summary}</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-8">
          <ScoreCard score={result.match_score} />
          <KeywordMatch matches={result.keyword_matches} misses={result.keyword_misses} />
          <GapAnalysis gaps={result.gap_analysis} />
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <CvComparison sections={result.sections} />
        </div>
      </div>
    </main>
  );
}
