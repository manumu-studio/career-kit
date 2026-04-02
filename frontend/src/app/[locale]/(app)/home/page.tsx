"use client";

/** Upload page where users submit CV + job description for optimization. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CacheHitBanner } from "@/components/ui/CacheHitBanner";
import { CompanySearch } from "@/components/ui/CompanySearch";
import { FileUpload } from "@/components/ui/FileUpload";
import { JobDescription } from "@/components/ui/JobDescription";
import { ProviderSelector, useProviderSelector } from "@/components/ui/ProviderSelector";
import { useOptimizationContext } from "@/context/OptimizationContext";
import { useSession } from "@/features/auth";
import { useToast } from "@/components/ui/Toast";
import {
  checkOptimizationCache,
  compareProviders,
  handleApiError,
  optimizeCV,
} from "@/lib/api";
import type { CachedMatchInfo } from "@/types/history";
import type { CompanyResearchResult } from "@/types/company";

const STAGGER_DELAY = 0.15;

export default function Home() {
  const locale = useLocale() as "en" | "es";
  const searchParams = useSearchParams();
  const isTailorMode = searchParams.get("mode") === "tailor";
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
  const reducedMotion = useReducedMotion();

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

  const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reducedMotion
        ? { duration: 0 }
        : { delay: i * STAGGER_DELAY, duration: 0.3 },
    }),
  };

  const currentStepLabel = OPTIMIZATION_STEPS[progressStep] ?? OPTIMIZATION_STEPS[0];

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
                      setCompanyResearch(null);
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
                    onViewReport={() => {
                      router.push("/report");
                    }}
                    userId={session?.user?.externalId}
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
                onChange={onChange}
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
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted-foreground">{t("compareDesc")}</p>
              <div className="flex flex-wrap gap-4">
                {(["anthropic", "openai", "gemini"] as const).map((name) => (
                  <label
                    key={name}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
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
              <Button
                variant="outline"
                size="sm"
                disabled={!isReadyToSubmit || isComparing || compareSelected.size < 2}
                onClick={() => void handleCompare()}
              >
                {isComparing ? t("comparing") : t("runComparison")}
              </Button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
