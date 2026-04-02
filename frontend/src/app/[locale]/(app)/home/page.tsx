"use client";

/** Upload page where users submit CV + job description for optimization. */
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CompareProvidersPanel } from "@/components/app/CompareProvidersPanel";
import { CacheHitBanner } from "@/components/ui/CacheHitBanner";
import { CompanySearch } from "@/components/ui/CompanySearch";
import { FileUpload } from "@/components/ui/FileUpload";
import { JobDescription } from "@/components/ui/JobDescription";
import { ProviderSelector } from "@/components/ui/ProviderSelector";
import { useHomePage } from "./useHomePage";

export default function Home() {
  const {
    t,
    isTailorMode,
    formState,
    companyResearch,
    file,
    jobDescription,
    jobDescTrimmed,
    isReadyToSubmit,
    isSubmitting,
    submissionError,
    optimizationCachedMatch,
    compareExpanded,
    setCompareExpanded,
    compareSelected,
    isComparing,
    currentStepLabel,
    sectionVariants,
    sessionUserId,
    available,
    defaultProvider,
    selected,
    onProviderChange,
    providersLoading,
    handleJobDescriptionChange,
    handleFileChange,
    handleSubmit,
    handleViewPreviousOptimization,
    handleOptimizeAgain,
    handleResearchComplete,
    toggleCompareProvider,
    handleCompare,
    setSubmissionError,
    skipCompanyResearch,
    navigateToReport,
    locale,
  } = useHomePage();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-4 py-10 sm:px-6 sm:py-12">
      {isSubmitting ? (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-foreground">{currentStepLabel}</p>
        </div>
      ) : null}

      <header>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </header>

      <motion.div
        className="rounded-xl border border-border bg-card p-6 shadow-sm"
        custom={0}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">{t("step1Label")}</h2>
            <FileUpload onFileChange={handleFileChange} />
            {!file && formState.fileName ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {t("previouslySelected")}{" "}
                <span className="font-medium text-foreground">{formState.fileName}</span> —{" "}
                {t("reSelectFile")}
              </p>
            ) : null}
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">{t("step2Label")}</h2>
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
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          {isTailorMode ? (
            <p
              className="mb-4 rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3 text-sm text-foreground"
              role="status"
            >
              {t("tailorModeBanner")}
            </p>
          ) : null}
          <Accordion defaultValue={isTailorMode ? ["company"] : []} multiple>
            <AccordionItem value="company" className="border-none">
              <div className="flex flex-wrap items-center gap-2">
                <AccordionTrigger className="flex-1 py-2 text-sm font-medium hover:no-underline">
                  {companyResearch ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" aria-hidden />
                      {t("companyResearchOptional")}
                    </span>
                  ) : (
                    t("companyResearchOptional")
                  )}
                </AccordionTrigger>
                {companyResearch ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground underline hover:text-foreground"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      skipCompanyResearch();
                    }}
                  >
                    {t("skipResearch")}
                  </Button>
                ) : null}
              </div>
              <AccordionContent>
                <div className="pt-2">
                  <CompanySearch
                    onResearchComplete={handleResearchComplete}
                    onResearchError={(error) => {
                      setSubmissionError(error);
                    }}
                    onViewReport={navigateToReport}
                    {...(sessionUserId !== undefined ? { userId: sessionUserId } : {})}
                    language={locale}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mt-6 space-y-4 border-t border-border pt-6">
          {optimizationCachedMatch ? (
            <CacheHitBanner
              match={optimizationCachedMatch}
              onRunAgain={handleOptimizeAgain}
              onUseCached={handleViewPreviousOptimization}
              variant="optimization"
            />
          ) : null}

          {submissionError ? (
            <p className="text-sm text-destructive">{submissionError}</p>
          ) : null}

          {companyResearch ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" aria-hidden />
              {t("companyTailoredBadge")}
            </span>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            {!providersLoading ? (
              <ProviderSelector
                value={selected}
                onChange={onProviderChange}
                available={available}
                defaultProvider={defaultProvider}
                disabled={isSubmitting}
              />
            ) : null}
            <Button
              className="animate-ai-gradient border-0 bg-clip-padding text-white hover:opacity-90"
              aria-label={
                !isReadyToSubmit ? t("ariaOptimizeDisabled") : t("ariaOptimizeReady")
              }
              disabled={!isReadyToSubmit}
              onClick={() => void handleSubmit()}
              title={!isReadyToSubmit ? t("ariaOptimizeDisabled") : undefined}
            >
              {companyResearch ? t("tailorAndOptimizeButton") : t("optimizeButton")}
            </Button>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            type="button"
            onClick={() => setCompareExpanded((e) => !e)}
          >
            {compareExpanded ? t("hideProviders") : t("compareProviders")}
          </Button>
          {compareExpanded ? (
            <CompareProvidersPanel
              availableProviders={available}
              selectedProviders={compareSelected}
              onToggle={toggleCompareProvider}
              onCompare={handleCompare}
              isComparing={isComparing}
              isReadyToSubmit={isReadyToSubmit}
              selectedProvider={selected}
            />
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
