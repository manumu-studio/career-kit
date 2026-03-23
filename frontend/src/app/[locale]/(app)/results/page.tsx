"use client";

/** Results page showing match score, comparison details, keywords, and gaps. */
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CompanyInfo } from "@/components/ui/CompanyInfo";
import { CoverLetterDisplay } from "@/components/ui/CoverLetterDisplay";
import { CvComparison } from "@/components/ui/CvComparison";
import { ExportToolbar } from "@/components/ui/ExportToolbar";
import { GapAnalysis } from "@/components/ui/GapAnalysis";
import { KeywordMatch } from "@/components/ui/KeywordMatch";
import { Badge } from "@/components/ui/badge";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { ToneSelector } from "@/components/ui/ToneSelector";
import { useOptimizationContext } from "@/context/OptimizationContext";
import { useSession } from "@/features/auth";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useToast } from "@/components/ui/Toast";
import { generateCoverLetter, handleApiError } from "@/lib/api";
import type { CoverLetterTone } from "@/types/cover-letter";

const SECTION_STAGGER = 0.2;

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

  const reducedMotion = useReducedMotion();
  const companyName =
    companyResearch?.profile?.name ?? formState.companyName ?? coverCompanyName;
  const roleName = formState.jobTitle || null;

  if (!result) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
        <LoadingSkeleton variant="results" />
      </div>
    );
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reducedMotion
        ? { duration: 0 }
        : { delay: i * SECTION_STAGGER, duration: 0.3 },
    }),
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-24 py-8 sm:px-6 md:pb-24 md:py-10 lg:py-12">
      {/* Floating export toolbar */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/90 py-3 backdrop-blur-md">
        <ExportToolbar
          optimizationResult={result}
          coverLetter={coverLetter}
        />
      </div>

      {/* Section 1 — Header + Summary (full width) */}
      <section className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
              {t("title")}
            </h1>
            {(() => {
              const p = providerUsed ?? result?.provider;
              return p && ["anthropic", "openai", "gemini"].includes(p) ? (
                <ProviderBadge provider={p as "anthropic" | "openai" | "gemini"} />
              ) : null;
            })()}
            {companyResearch ? (
              <Badge
                variant="default"
                className="bg-primary/90 text-primary-foreground"
              >
                {companyName
                  ? t("companyTailoredFor", { company: companyName })
                  : t("companyTailoredBadge")}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{t("readyMessage")}</p>
          <motion.div
            aria-live="polite"
            aria-label="Optimization summary"
            className="rounded-xl border border-border bg-card p-5"
            custom={0}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
          </motion.div>
        </div>
        <Link
          className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
          href="/home"
        >
          {t("backToUpload")}
        </Link>
      </section>

      {/* Section 2 — Score + Keywords (side by side on desktop) */}
      <motion.div
        aria-label="Score and keywords"
        className="grid gap-6 lg:grid-cols-[280px_1fr]"
        custom={1}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <ScoreCard score={result.match_score} />
        <KeywordMatch matches={result.keyword_matches} misses={result.keyword_misses} />
      </motion.div>

      {/* Section 3 — CV Comparison (full width) */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <CvComparison sections={result.sections} />
      </motion.div>

      {/* Section 4 — Gap Analysis (full width grid) */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <GapAnalysis gaps={result.gap_analysis} />
      </motion.div>

      {!coverLetter ? (
        <motion.section
          className="rounded-xl border border-border bg-card p-5"
          custom={4}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t("generateOptional")}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">{t("generateDesc")}</p>
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
              <p className="text-sm text-destructive">{coverError}</p>
            ) : null}
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {t("generating")}
                </>
              ) : (
                t("generateCoverLetter")
              )}
            </button>
          </div>
        </motion.section>
      ) : null}

      {coverLetter ? (
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <CoverLetterDisplay
            coverLetter={coverLetter}
            companyName={companyName || undefined}
            roleName={roleName}
          />
        </motion.div>
      ) : null}
    </div>
  );
}
