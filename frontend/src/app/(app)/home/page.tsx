"use client";

/** Upload page where users submit CV + job description for optimization. */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CacheHitBanner } from "@/components/ui/CacheHitBanner";
import { CompanySearch } from "@/components/ui/CompanySearch";
import { FileUpload } from "@/components/ui/FileUpload";
import { JobDescription } from "@/components/ui/JobDescription";
import { ProviderSelector, useProviderSelector } from "@/components/ui/ProviderSelector";
import { useOptimizationContext } from "@/context/OptimizationContext";
import { useSession } from "@/features/auth";
import { checkOptimizationCache, compareProviders, optimizeCV } from "@/lib/api";
import type { CachedMatchInfo } from "@/types/history";
import type { CompanyResearchResult } from "@/types/company";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
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
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [optimizationCachedMatch, setOptimizationCachedMatch] =
    useState<CachedMatchInfo | null>(null);
  const [compareExpanded, setCompareExpanded] = useState(false);
  const [compareSelected, setCompareSelected] = useState<Set<string>>(new Set());
  const [isComparing, setIsComparing] = useState(false);

  // Hydrate job description from persisted form state once context finishes loading.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (formState.jobDescription) {
      setJobDescription(formState.jobDescription);
      hydratedRef.current = true;
    }
  }, [formState.jobDescription]);

  const isReadyToSubmit = file !== null && jobDescription.trim().length > 0;

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
        });
        setResult(result, selected ?? undefined);
        router.push("/results");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to optimize CV. Please try again.";
        setSubmissionError(message);
      } finally {
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
      );
      setComparisonResult(result);
      router.push("/compare");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Comparison failed. Please try again.";
      setSubmissionError(msg);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Career Kit</h1>
        <p className="text-base text-slate-300">Optimize your CV for any job posting</p>
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
      />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Step 2: Upload CV + Job Description</h2>
        <button
          className="text-sm text-slate-300 underline"
          onClick={() => {
            setCompanyResearch(null);
          }}
          type="button"
        >
          Skip research
        </button>
      </div>

      <FileUpload onFileChange={handleFileChange} />
      {!file && formState.fileName ? (
        <p className="text-sm text-slate-400">
          Previously selected:{" "}
          <span className="font-medium text-slate-200">{formState.fileName}</span> — please
          re-select your file.
        </p>
      ) : null}
      <JobDescription onChange={handleJobDescriptionChange} value={jobDescription} />

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

      <button
        className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-sky-500 px-5 py-2.5 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
        disabled={!isReadyToSubmit || isSubmitting}
        onClick={() => {
          void handleSubmit();
        }}
        type="button"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            Analyzing...
          </>
        ) : (
          "Optimize My CV"
        )}
      </button>

      <div className="border-t border-slate-800 pt-6">
        <button
          className="text-sm text-slate-400 underline hover:text-slate-300"
          onClick={() => setCompareExpanded((e) => !e)}
          type="button"
        >
          {compareExpanded ? "Hide" : "Compare"} providers
        </button>
        {compareExpanded ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-slate-400">
              Run the same CV + JD through 2+ providers and compare results.
            </p>
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
                  {!available.includes(name) ? " (not configured)" : ""}
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
              {isComparing ? "Comparing..." : "Run comparison"}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
