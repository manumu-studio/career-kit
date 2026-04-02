"use client";

/** Company research form that triggers backend research and displays results. */
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  } = useCompanySearch({
    ...(userId !== undefined ? { userId } : {}),
    ...(language !== undefined ? { language } : {}),
  });
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
    <section className={cn("space-y-4", className)}>
      <p className="text-sm text-muted-foreground">{t("step1Desc")}</p>

      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-foreground">{t("companyNameRequired")}</span>
          <Input
            aria-label={t("companyName")}
            onChange={(event) => {
              setCompanyName(event.target.value);
            }}
            placeholder={t("companyPlaceholder")}
            type="text"
            value={companyName}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-foreground">{t("companyUrl")}</span>
          <Input
            aria-label={t("companyUrl")}
            onChange={(event) => {
              setCompanyUrl(event.target.value);
            }}
            placeholder={t("urlPlaceholder")}
            type="url"
            value={companyUrl}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-foreground">{t("jobTitle")}</span>
          <Input
            aria-label={t("jobTitle")}
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
        <Button
          disabled={isLoading || companyName.trim().length === 0}
          onClick={() => {
            void handleResearch();
          }}
        >
          {isLoading ? t("researching") : t("researchButton")}
        </Button>
        {error ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={clearError}
          >
            {t("dismiss")}
          </Button>
        ) : null}
      </div>

      {isLoading || currentStep === "done" || currentStep === "error" ? (
        <ResearchProgress currentStep={currentStep} />
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
