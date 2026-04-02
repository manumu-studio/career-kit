"use client";

/** State, validation, and handlers for the home CV upload and optimization flow. */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useReducedMotion } from "framer-motion";
import { useProviderSelector } from "@/components/ui/ProviderSelector";
import { useOptimizationContext } from "@/context/OptimizationContext";
import { useSession } from "@/features/auth";
import { useToast } from "@/components/ui/Toast";
import {
  checkOptimizationCache,
  compareProviders,
  handleApiError,
  optimizeCV,
  type OptimizeCvOptions,
} from "@/lib/api";
import type { CachedMatchInfo } from "@/types/history";
import type { CompanyResearchResult } from "@/types/company";

const STAGGER_DELAY = 0.15;

export interface UseHomePageResult {
  t: ReturnType<typeof useTranslations>;
  locale: "en" | "es";
  isTailorMode: boolean;
  formState: ReturnType<typeof useOptimizationContext>["formState"];
  companyResearch: CompanyResearchResult | null;
  setCompanyResearch: ReturnType<typeof useOptimizationContext>["setCompanyResearch"];
  file: File | null;
  jobDescription: string;
  jobDescTrimmed: string;
  isJobDescValid: boolean;
  isReadyToSubmit: boolean;
  isSubmitting: boolean;
  submissionError: string | null;
  optimizationCachedMatch: CachedMatchInfo | null;
  compareExpanded: boolean;
  setCompareExpanded: Dispatch<SetStateAction<boolean>>;
  compareSelected: Set<string>;
  isComparing: boolean;
  currentStepLabel: string;
  sectionVariants: {
    hidden: { opacity: number; y: number };
    visible: (i: number) => {
      opacity: number;
      y: number;
      transition: { duration: number; delay?: number };
    };
  };
  sessionUserId: string | undefined;
  available: string[];
  defaultProvider: string;
  selected: ReturnType<typeof useProviderSelector>["selected"];
  onProviderChange: ReturnType<typeof useProviderSelector>["onChange"];
  providersLoading: boolean;
  handleJobDescriptionChange: (value: string) => void;
  handleFileChange: (newFile: File | null) => void;
  handleSubmit: () => Promise<void>;
  handleViewPreviousOptimization: () => void;
  handleOptimizeAgain: () => void;
  handleResearchComplete: (researchResult: CompanyResearchResult) => void;
  toggleCompareProvider: (name: string) => void;
  handleCompare: () => Promise<void>;
  setSubmissionError: Dispatch<SetStateAction<string | null>>;
  skipCompanyResearch: () => void;
  navigateToReport: () => void;
}

export function useHomePage(): UseHomePageResult {
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
        const optimizeOptions: OptimizeCvOptions = {
          language: locale,
        };
        if (companyResearch) {
          optimizeOptions.companyContext = {
            companyName: companyResearch.profile.name,
            companyProfile: companyResearch.profile,
          };
        }
        const externalId = session?.user?.externalId;
        if (externalId !== undefined) {
          optimizeOptions.userId = externalId;
        }
        if (forceRefresh !== undefined) {
          optimizeOptions.forceRefresh = forceRefresh;
        }
        if (selected) {
          optimizeOptions.provider = selected;
        }
        const result = await optimizeCV(
          file,
          jobDescription.trim(),
          optimizeOptions,
        );
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

  return {
    t,
    locale,
    isTailorMode,
    formState,
    companyResearch,
    setCompanyResearch,
    file,
    jobDescription,
    jobDescTrimmed,
    isJobDescValid,
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
    sessionUserId: session?.user?.externalId,
    available,
    defaultProvider,
    selected,
    onProviderChange: onChange,
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
    skipCompanyResearch: () => setCompanyResearch(null),
    navigateToReport: () => router.push("/report"),
  };
}
