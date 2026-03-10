"use client";

/** Company research form that triggers backend research and displays results. */
import { useTranslations } from "next-intl";
import { handleApiError } from "@/lib/api";
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
  language,
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
  } = useCompanySearch({ userId, language });
  const t = useTranslations("companySearch");

  const handleResearch = async (forceRefresh?: boolean): Promise<void> => {
    try {
      const researchResult = await startResearch(forceRefresh);
      onResearchComplete(researchResult);
    } catch (requestError: unknown) {
      onResearchError(handleApiError(requestError));
    }
  };

  const handleUseCached = async (): Promise<void> => {
    if (!cachedMatch) return;
    try {
      const researchResult = await loadCachedResearch(cachedMatch);
      onResearchComplete(researchResult);
    } catch (requestError: unknown) {
      onResearchError(handleApiError(requestError));
    }
  };

  const handleResearchAgain = (): void => {
    dismissCachedBanner();
    void handleResearch(true);
  };

  return (
    <section className={cn("space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5", className)}>
      <h2 className="text-lg font-semibold text-white">{t("step1")}</h2>
      <p className="text-sm text-slate-300">{t("step1Desc")}</p>

      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-200">{t("companyNameRequired")}</span>
          <input
            aria-label={t("companyName")}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            onChange={(event) => {
              setCompanyName(event.target.value);
            }}
            placeholder={t("companyPlaceholder")}
            type="text"
            value={companyName}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-200">{t("companyUrl")}</span>
          <input
            aria-label={t("companyUrl")}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            onChange={(event) => {
              setCompanyUrl(event.target.value);
            }}
            placeholder={t("urlPlaceholder")}
            type="url"
            value={companyUrl}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-200">{t("jobTitle")}</span>
          <input
            aria-label={t("jobTitle")}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            onChange={(event) => {
              setJobTitle(event.target.value);
            }}
            placeholder={t("jobPlaceholder")}
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
          {isLoading ? t("researching") : t("researchButton")}
        </button>
        {error ? (
          <button
            className="text-sm text-slate-300 underline"
            onClick={clearError}
            type="button"
          >
            {t("dismiss")}
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
