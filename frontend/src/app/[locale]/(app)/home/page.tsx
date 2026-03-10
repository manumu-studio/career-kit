"use client";

/** Upload page where users submit CV + job description for optimization. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CacheHitBanner } from "@/components/ui/CacheHitBanner";
import { CompanySearch } from "@/components/ui/CompanySearch";
import { FileUpload } from "@/components/ui/FileUpload";
import { JobDescription } from "@/components/ui/JobDescription";
import { ProviderSelector, useProviderSelector } from "@/components/ui/ProviderSelector";
import { useOptimizationContext } from "@/context/OptimizationContext";
import { useSession } from "@/features/auth";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import {
  checkOptimizationCache,
  compareProviders,
  handleApiError,
  optimizeCV,
} from "@/lib/api";
import type { CachedMatchInfo } from "@/types/history";
import type { CompanyResearchResult } from "@/types/company";

export default function Home() {
  const locale = useLocale() as "en" | "es";
  const t = useTranslations("home");
  const { data: session } = useSession();
  const router = useRouter();
  const OPTIMIZATION_STEPS = useMemo(
    () =>
      [
        t("stepUploading"),
        t("stepParsing"),
        t("stepAnalyzing"),
        t("stepGenerating"),
      ] as const,
    [t],
  );
  const {
    companyResearch,
    setCompanyResearch,
    setComparisonResult,
    setResult,
    formState,
    setFormState,
  } = useOptimizationContext();
  const { available, defaultProvider, selected, onChange, loading: providersLoading } =
    useProviderSelector();
  const { error: toastError } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [optimizationCachedMatch, setOptimizationCachedMatch] =
    useState<CachedMatchInfo | null>(null);
  const [compareExpanded, setCompareExpanded] = useState(false);
  const [compareSelected, setCompareSelected] = useState<Set<string>>(new Set());
  const [isComparing, setIsComparing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  // Hydrate job description from persisted form state once context finishes loading.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (formState.jobDescription) {
      setJobDescription(formState.jobDescription);
      hydratedRef.current = true;
    }
  }, [formState.jobDescription]);

  const jobDescTrimmed = jobDescription.trim();
  const isJobDescValid =
    jobDescTrimmed.length >= 50 && jobDescTrimmed.length <= 10000;
  const isReadyToSubmit = file !== null && isJobDescValid;

  const handleJobDescriptionChange = (value: string): void => {
    setJobDescription(value);
    setFormState({ jobDescription: value });
  };

  const handleFileChange = useCallback(
    (newFile: File | null): void => {
      setFile(newFile);
      setFormState({ fileName: newFile?.name ?? null });
    },
    [setFormState],
  );

  const runOptimization = useCallback(
    async (forceRefresh?: boolean): Promise<void> => {
      if (!file || !isReadyToSubmit) return;
      setSubmissionError(null);
      setOptimizationCachedMatch(null);
      setIsSubmitting(true);
      setProgressStep(0);
      let stepInterval: ReturnType<typeof setInterval> | null = null;
      const steps = OPTIMIZATION_STEPS;
      stepInterval = setInterval(() => {
        setProgressStep((s) => Math.min(s + 1, steps.length - 1));
      }, 3000);
      try {
        const result = await optimizeCV(file, jobDescription.trim(), {
          companyContext: companyResearch
            ? {
                companyName: companyResearch.profile.name,
                companyProfile: companyResearch.profile,
              }
            : undefined,
          userId: session?.user?.externalId,
          forceRefresh,
          provider: selected ?? undefined,
          language: locale,
        });
        setResult(result, selected ?? undefined);
        router.push("/results");
      } catch (err: unknown) {
        const msg = handleApiError(err);
        setSubmissionError(msg);
        toastError(msg);
      } finally {
        if (stepInterval) clearInterval(stepInterval);
        setIsSubmitting(false);
      }
    },
    [
      file,
      jobDescription,
      isReadyToSubmit,
      companyResearch,
      session?.user?.externalId,
      router,
      setResult,
      selected,
      toastError,
      OPTIMIZATION_STEPS,
      locale,
    ],
  );

  const handleSubmit = async (): Promise<void> => {
    if (!file || !isReadyToSubmit) return;

    setSubmissionError(null);
    const companyUrl = companyResearch?.profile?.website ?? undefined;

    try {
      const check = await checkOptimizationCache(
        jobDescription.trim(),
        companyUrl,
        session?.user?.externalId,
      );
      if (check.cached && check.match) {
        setOptimizationCachedMatch(check.match);
        return;
      }
    } catch {
      // Proceed with optimization if check fails
    }

    void runOptimization();
  };

  const handleViewPreviousOptimization = (): void => {
    if (optimizationCachedMatch) {
      router.push(`/history/${optimizationCachedMatch.analysis_id}`);
      setOptimizationCachedMatch(null);
    }
  };

  const handleOptimizeAgain = (): void => {
    setOptimizationCachedMatch(null);
    void runOptimization(true);
  };

  const handleResearchComplete = (researchResult: CompanyResearchResult): void => {
    setCompanyResearch(researchResult);
  };

  const toggleCompareProvider = (name: string): void => {
    setCompareSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleCompare = async (): Promise<void> => {
    if (!file || !jobDescription.trim() || compareSelected.size < 2) return;
    setSubmissionError(null);
    setIsComparing(true);
    try {
      const result = await compareProviders(
        file,
        jobDescription.trim(),
        Array.from(compareSelected),
        locale,
      );
      setComparisonResult(result);
      router.push("/compare");
    } catch (err: unknown) {
      const msg = handleApiError(err);
      setSubmissionError(msg);
      toastError(msg);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-4 py-10 sm:px-6 sm:py-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-white">{t("title")}</h1>
        <p className="text-base text-slate-300">{t("subtitle")}</p>
      </header>

      <CompanySearch
        onResearchComplete={handleResearchComplete}
        onResearchError={(error) => {
          setSubmissionError(error);
        }}
        onViewReport={() => {
          router.push("/report");
        }}
        userId={session?.user?.externalId}
        language={locale}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t("step2")}</h2>
        <button
          className="text-sm text-slate-300 underline"
          onClick={() => {
            setCompanyResearch(null);
          }}
          type="button"
        >
          {t("skipResearch")}
        </button>
      </div>

      <FileUpload onFileChange={handleFileChange} />
      {!file && formState.fileName ? (
        <p className="text-sm text-slate-400">
          {t("previouslySelected")}{" "}
          <span className="font-medium text-slate-200">{formState.fileName}</span> — {t("reSelectFile")}
        </p>
      ) : null}
      <JobDescription
        onChange={handleJobDescriptionChange}
        value={jobDescription}
        error={
          jobDescTrimmed.length > 0 && jobDescTrimmed.length < 50
            ? t("minCharsError")
            : jobDescTrimmed.length > 10000
              ? t("maxCharsError")
              : null
        }
        minLength={50}
        maxLength={10000}
      />

      {!providersLoading ? (
        <ProviderSelector
          value={selected}
          onChange={onChange}
          available={available}
          defaultProvider={defaultProvider}
          disabled={isSubmitting}
        />
      ) : null}

      {optimizationCachedMatch ? (
        <CacheHitBanner
          match={optimizationCachedMatch}
          onRunAgain={handleOptimizeAgain}
          onUseCached={handleViewPreviousOptimization}
          variant="optimization"
        />
      ) : null}

      {submissionError ? <p className="text-sm text-rose-300">{submissionError}</p> : null}

      {isSubmitting ? (
        <div className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <ProgressBar steps={OPTIMIZATION_STEPS} currentStep={progressStep} />
        </div>
      ) : (
        <button
          aria-label={
            !isReadyToSubmit
              ? t("ariaOptimizeDisabled")
              : t("ariaOptimizeReady")
          }
          className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-sky-500 px-5 py-2.5 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          disabled={!isReadyToSubmit}
          onClick={() => {
            void handleSubmit();
          }}
          title={!isReadyToSubmit ? t("ariaOptimizeDisabled") : undefined}
          type="button"
        >
          {t("optimizeButton")}
        </button>
      )}

      <div className="border-t border-slate-800 pt-6">
        <button
          className="text-sm text-slate-400 underline hover:text-slate-300"
          onClick={() => setCompareExpanded((e) => !e)}
          type="button"
        >
          {compareExpanded ? t("hideProviders") : t("compareProviders")}
        </button>
        {compareExpanded ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-slate-400">{t("compareDesc")}</p>
            <div className="flex flex-wrap gap-4">
              {(["anthropic", "openai", "gemini"] as const).map((name) => (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-2 text-sm text-slate-300"
                >
                  <input
                    checked={compareSelected.has(name)}
                    disabled={!available.includes(name)}
                    onChange={() => toggleCompareProvider(name)}
                    type="checkbox"
                  />
                  {name}
                  {!available.includes(name) ? ` ${t("notConfigured")}` : ""}
                </label>
              ))}
            </div>
            <button
              className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                !isReadyToSubmit || isComparing || compareSelected.size < 2
              }
              onClick={() => void handleCompare()}
              type="button"
            >
              {isComparing ? t("comparing") : t("runComparison")}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
