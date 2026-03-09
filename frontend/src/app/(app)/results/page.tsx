"use client";

/** Results page showing match score, comparison details, keywords, and gaps. */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompanyInfo } from "@/components/ui/CompanyInfo";
import { CoverLetterDisplay } from "@/components/ui/CoverLetterDisplay";
import { CvComparison } from "@/components/ui/CvComparison";
import { ExportToolbar } from "@/components/ui/ExportToolbar";
import { GapAnalysis } from "@/components/ui/GapAnalysis";
import { KeywordMatch } from "@/components/ui/KeywordMatch";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { ToneSelector } from "@/components/ui/ToneSelector";
import { useOptimizationContext } from "@/context/OptimizationContext";
import { useSession } from "@/features/auth";
import { generateCoverLetter } from "@/lib/api";
import type { CoverLetterTone } from "@/types/cover-letter";

function buildCvTextFromSections(
  sections: { heading: string; original: string }[],
): string {
  return sections
    .map((s) => `${s.heading}\n${s.original}`)
    .join("\n\n");
}

export default function ResultsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    result,
    providerUsed,
    coverLetter,
    setCoverLetter,
    formState,
    companyResearch,
  } = useOptimizationContext();
  const [coverCompanyName, setCoverCompanyName] = useState(
    () => companyResearch?.profile?.name ?? formState.companyName ?? "",
  );
  const [coverHiringManager, setCoverHiringManager] = useState<string | null>(
    null,
  );
  const [coverTone, setCoverTone] = useState<CoverLetterTone>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  useEffect(() => {
    if (!coverCompanyName && (companyResearch?.profile?.name ?? formState.companyName)) {
      setCoverCompanyName(
        companyResearch?.profile?.name ?? formState.companyName ?? "",
      );
    }
  }, [companyResearch?.profile?.name, formState.companyName, coverCompanyName]);

  // Keep users on the upload route when there is no optimization payload.
  useEffect(() => {
    if (!result) {
      router.replace("/home");
    }
  }, [result, router]);

  const handleGenerateCoverLetter = useCallback(async () => {
    if (!result || !formState.jobDescription.trim() || !coverCompanyName.trim()) {
      setCoverError("Company name and job description are required.");
      return;
    }
    setCoverError(null);
    setIsGenerating(true);
    try {
      const cvText = buildCvTextFromSections(result.sections);
      const letter = await generateCoverLetter(
        {
          cv_text: cvText,
          job_description: formState.jobDescription.trim(),
          company_name: coverCompanyName.trim(),
          hiring_manager: coverHiringManager?.trim() || null,
          tone: coverTone,
        },
        session?.user?.externalId,
      );
      setCoverLetter(letter);
    } catch (err: unknown) {
      setCoverError(
        err instanceof Error ? err.message : "Failed to generate cover letter.",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [
    result,
    formState.jobDescription,
    coverCompanyName,
    coverHiringManager,
    coverTone,
    session?.user?.externalId,
    setCoverLetter,
  ]);

  if (!result) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:py-12">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold text-white">Optimization Results</h1>
            {(() => {
              const p = providerUsed ?? result?.provider;
              return p && ["anthropic", "openai", "gemini"].includes(p) ? (
                <ProviderBadge provider={p as "anthropic" | "openai" | "gemini"} />
              ) : null;
            })()}
          </div>
          <p className="text-sm text-slate-400">Your job-tailored CV improvements are ready.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportToolbar
            optimizationResult={result}
            coverLetter={coverLetter}
          />
          <Link
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            href="/home"
          >
            Back to Upload
          </Link>
        </div>
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

      {!coverLetter ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Generate Cover Letter (optional)
          </h2>
          <p className="mb-4 text-sm text-slate-400">
            Create a tailored cover letter from your CV and job description.
          </p>
          <div className="space-y-4">
            <CompanyInfo
              companyName={coverCompanyName}
              hiringManager={coverHiringManager}
              onCompanyNameChange={setCoverCompanyName}
              onHiringManagerChange={setCoverHiringManager}
              disabled={isGenerating}
            />
            <ToneSelector
              value={coverTone}
              onChange={setCoverTone}
              disabled={isGenerating}
            />
            {coverError ? (
              <p className="text-sm text-rose-300">{coverError}</p>
            ) : null}
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                isGenerating ||
                !coverCompanyName.trim() ||
                !formState.jobDescription.trim()
              }
              onClick={() => void handleGenerateCoverLetter()}
              type="button"
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Generating...
                </>
              ) : (
                "Generate Cover Letter"
              )}
            </button>
          </div>
        </section>
      ) : null}

      {coverLetter ? (
        <CoverLetterDisplay coverLetter={coverLetter} />
      ) : null}
    </main>
  );
}
