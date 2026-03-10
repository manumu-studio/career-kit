"use client";

/** Results page showing match score, comparison details, keywords, and gaps. */
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
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
import { useToast } from "@/components/ui/Toast";
import { generateCoverLetter, handleApiError } from "@/lib/api";
import type { CoverLetterTone } from "@/types/cover-letter";

function buildCvTextFromSections(
  sections: { heading: string; original: string }[],
): string {
  return sections
    .map((s) => `${s.heading}\n${s.original}`)
    .join("\n\n");
}

export default function ResultsPage() {
  const locale = useLocale() as "en" | "es";
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
  const { error: toastError } = useToast();

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

  const t = useTranslations("results");

  const handleGenerateCoverLetter = useCallback(async () => {
    if (!result || !formState.jobDescription.trim() || !coverCompanyName.trim()) {
      setCoverError(t("companyRequired"));
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
          language: locale,
        },
        session?.user?.externalId,
      );
      setCoverLetter(letter);
    } catch (err: unknown) {
      const msg = handleApiError(err);
      setCoverError(msg);
      toastError(msg);
    } finally {
      setIsGenerating(false);
    }
  }, [
    result,
    formState.jobDescription,
    coverCompanyName,
    coverHiringManager,
    coverTone,
    locale,
    session?.user?.externalId,
    setCoverLetter,
    toastError,
    t,
  ]);

  if (!result) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 pb-24 py-8 sm:px-6 md:pb-0 md:py-10 lg:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              {t("title")}
            </h1>
            {(() => {
              const p = providerUsed ?? result?.provider;
              return p && ["anthropic", "openai", "gemini"].includes(p) ? (
                <ProviderBadge provider={p as "anthropic" | "openai" | "gemini"} />
              ) : null;
            })()}
          </div>
          <p className="text-sm text-slate-400">{t("readyMessage")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden md:contents">
            <ExportToolbar
              optimizationResult={result}
              coverLetter={coverLetter}
            />
          </div>
          <Link
            className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
            href="/home"
          >
            {t("backToUpload")}
          </Link>
        </div>
      </header>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center gap-2 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur md:hidden">
        <ExportToolbar
          optimizationResult={result}
          coverLetter={coverLetter}
        />
      </div>

      <section
        aria-live="polite"
        aria-label="Optimization summary"
        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
      >
        <p className="text-sm leading-relaxed text-slate-200">{result.summary}</p>
      </section>

      <div
        aria-label="Optimization results"
        className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]"
      >
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
            {t("generateOptional")}
          </h2>
          <p className="mb-4 text-sm text-slate-400">{t("generateDesc")}</p>
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
                  {t("generating")}
                </>
              ) : (
                t("generateCoverLetter")
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
