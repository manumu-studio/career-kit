"use client";

/** Company research form that triggers backend research and displays results. */
import { cn } from "@/lib/utils";
import { CacheHitBanner } from "@/components/ui/CacheHitBanner";
import { CompanyCard } from "@/components/ui/CompanyCard";
import { ResearchProgress } from "@/components/ui/ResearchProgress";
import type { CompanySearchProps } from "./CompanySearch.types";
import { useCompanySearch } from "./useCompanySearch";

export function CompanySearch({
  onResearchComplete,
  onResearchError,
  onViewReport,
  userId,
  className,
}: CompanySearchProps) {
  const {
    companyName,
    companyUrl,
    jobTitle,
    currentStep,
    isLoading,
    error,
    result,
    cachedMatch,
    setCompanyName,
    setCompanyUrl,
    setJobTitle,
    startResearch,
    loadCachedResearch,
    dismissCachedBanner,
    clearError,
  } = useCompanySearch({ userId });

  const handleResearch = async (forceRefresh?: boolean): Promise<void> => {
    try {
      const researchResult = await startResearch(forceRefresh);
      onResearchComplete(researchResult);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error ? requestError.message : "Company research failed.";
      onResearchError(message);
    }
  };

  const handleUseCached = async (): Promise<void> => {
    if (!cachedMatch) return;
    try {
      const researchResult = await loadCachedResearch(cachedMatch);
      onResearchComplete(researchResult);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error ? requestError.message : "Failed to load cached research.";
      onResearchError(message);
    }
  };

  const handleResearchAgain = (): void => {
    dismissCachedBanner();
    void handleResearch(true);
  };

  return (
    <section className={cn("space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5", className)}>
      <h2 className="text-lg font-semibold text-white">Step 1: Company Research (Optional)</h2>
      <p className="text-sm text-slate-300">
        Research company values, culture, and interview insights before optimizing your CV.
      </p>

      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-200">Company Name *</span>
          <input
            aria-label="Company name"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            onChange={(event) => {
              setCompanyName(event.target.value);
            }}
            placeholder="Stripe"
            type="text"
            value={companyName}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-200">Company Website URL</span>
          <input
            aria-label="Company website URL"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            onChange={(event) => {
              setCompanyUrl(event.target.value);
            }}
            placeholder="https://stripe.com"
            type="url"
            value={companyUrl}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-200">Job Title</span>
          <input
            aria-label="Job title"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            onChange={(event) => {
              setJobTitle(event.target.value);
            }}
            placeholder="Software Engineer"
            type="text"
            value={jobTitle}
          />
        </label>
      </div>

      {cachedMatch && !result ? (
        <CacheHitBanner
          match={cachedMatch}
          onRunAgain={handleResearchAgain}
          onUseCached={handleUseCached}
          variant="research"
        />
      ) : null}

      <div className="flex items-center gap-3">
        <button
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          disabled={isLoading || companyName.trim().length === 0}
          onClick={() => {
            void handleResearch();
          }}
          type="button"
        >
          {isLoading ? "Researching..." : "Research Company"}
        </button>
        {error ? (
          <button
            className="text-sm text-slate-300 underline"
            onClick={clearError}
            type="button"
          >
            Dismiss
          </button>
        ) : null}
      </div>

      {isLoading || currentStep === "done" || currentStep === "error" ? (
        <ResearchProgress currentStep={currentStep} />
      ) : null}

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {result ? (
        <CompanyCard
          onViewFullReport={() => {
            if (onViewReport) {
              onViewReport();
            }
          }}
          profile={result.profile}
          researchQuality={result.research_quality}
        />
      ) : null}
    </section>
  );
}
