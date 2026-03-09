"use client";

/** Stores the latest optimization response for cross-page access. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CompanyResearchResult } from "@/types/company";
import type { CoverLetterResult } from "@/types/cover-letter";
import type { ComparisonResult, LLMProviderName } from "@/types/provider";
import type { OptimizationResult } from "@/types/optimization";

const OPTIMIZATION_STORAGE_KEY = "optimization-result-v1";
const PROVIDER_USED_KEY = "ats-provider-used";
const COMPANY_RESEARCH_STORAGE_KEY = "ats-company-research";
const COVER_LETTER_STORAGE_KEY = "ats-cover-letter-v1";
const FORM_STATE_STORAGE_KEY = "ats-form-state-v1";

export interface FormState {
  companyName: string;
  companyUrl: string;
  jobTitle: string;
  jobDescription: string;
  fileName: string | null;
}

const DEFAULT_FORM_STATE: FormState = {
  companyName: "",
  companyUrl: "",
  jobTitle: "",
  jobDescription: "",
  fileName: null,
};

interface OptimizationContextValue {
  result: OptimizationResult | null;
  providerUsed: LLMProviderName | null;
  comparisonResult: ComparisonResult | null;
  companyResearch: CompanyResearchResult | null;
  coverLetter: CoverLetterResult | null;
  formState: FormState;
  setResult: (result: OptimizationResult, provider?: LLMProviderName) => void;
  setComparisonResult: (result: ComparisonResult | null) => void;
  setCompanyResearch: (result: CompanyResearchResult | null) => void;
  setCoverLetter: (result: CoverLetterResult | null) => void;
  clearResult: () => void;
  setFormState: (update: Partial<FormState>) => void;
  clearFormState: () => void;
}

const OptimizationContext = createContext<OptimizationContextValue | undefined>(undefined);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isOptimizationResult(value: unknown): value is OptimizationResult {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.summary === "string" &&
    typeof value.match_score === "number" &&
    isStringArray(value.keyword_matches) &&
    isStringArray(value.keyword_misses) &&
    Array.isArray(value.sections) &&
    Array.isArray(value.gap_analysis)
  );
}

function isFormState(value: unknown): value is FormState {
  if (!isObject(value)) {
    return false;
  }
  return (
    typeof value.companyName === "string" &&
    typeof value.companyUrl === "string" &&
    typeof value.jobTitle === "string" &&
    typeof value.jobDescription === "string" &&
    (value.fileName === null || typeof value.fileName === "string")
  );
}

function isCoverLetterResult(value: unknown): value is CoverLetterResult {
  if (!isObject(value)) return false;
  return (
    typeof value.greeting === "string" &&
    typeof value.opening_paragraph === "string" &&
    Array.isArray(value.body_paragraphs) &&
    typeof value.closing_paragraph === "string" &&
    typeof value.sign_off === "string" &&
    isStringArray(value.key_selling_points) &&
    typeof value.tone_used === "string" &&
    typeof value.word_count === "number"
  );
}

function isCompanyResearchResult(value: unknown): value is CompanyResearchResult {
  if (!isObject(value)) {
    return false;
  }
  if (!isObject(value.profile) || !isObject(value.report)) {
    return false;
  }
  return (
    typeof value.profile.name === "string" &&
    typeof value.report.executive_summary === "string" &&
    isStringArray(value.sources_used) &&
    typeof value.research_quality === "string" &&
    typeof value.researched_at === "string"
  );
}

export function OptimizationProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [result, setResultState] = useState<OptimizationResult | null>(null);
  const [providerUsed, setProviderUsedState] = useState<LLMProviderName | null>(null);
  const [comparisonResult, setComparisonResultState] =
    useState<ComparisonResult | null>(null);
  const [companyResearch, setCompanyResearchState] =
    useState<CompanyResearchResult | null>(null);
  const [coverLetter, setCoverLetterState] = useState<CoverLetterResult | null>(null);
  const [formState, setFormStateRaw] = useState<FormState>(DEFAULT_FORM_STATE);

  // Hydrate latest result from session storage after initial mount.
  useEffect(() => {
    const optimizationStored = sessionStorage.getItem(OPTIMIZATION_STORAGE_KEY);
    if (optimizationStored) {
      try {
        const parsed: unknown = JSON.parse(optimizationStored);
        if (isOptimizationResult(parsed)) {
          setResultState(parsed);
          const p = (parsed as { provider?: string }).provider;
          if (p && ["anthropic", "openai", "gemini"].includes(p)) {
            setProviderUsedState(p as LLMProviderName);
          }
        }
      } catch {
        sessionStorage.removeItem(OPTIMIZATION_STORAGE_KEY);
      }
    }

    const companyStored = sessionStorage.getItem(COMPANY_RESEARCH_STORAGE_KEY);
    if (companyStored) {
      try {
        const parsed: unknown = JSON.parse(companyStored);
        if (isCompanyResearchResult(parsed)) {
          setCompanyResearchState(parsed);
        }
      } catch {
        sessionStorage.removeItem(COMPANY_RESEARCH_STORAGE_KEY);
      }
    }

    const formStored = sessionStorage.getItem(FORM_STATE_STORAGE_KEY);
    if (formStored) {
      try {
        const parsed: unknown = JSON.parse(formStored);
        if (isFormState(parsed)) {
          setFormStateRaw(parsed);
        }
      } catch {
        sessionStorage.removeItem(FORM_STATE_STORAGE_KEY);
      }
    }

    const coverLetterStored = sessionStorage.getItem(COVER_LETTER_STORAGE_KEY);
    if (coverLetterStored) {
      try {
        const parsed: unknown = JSON.parse(coverLetterStored);
        if (isCoverLetterResult(parsed)) {
          setCoverLetterState(parsed);
        }
      } catch {
        sessionStorage.removeItem(COVER_LETTER_STORAGE_KEY);
      }
    }

    const providerStored = sessionStorage.getItem(PROVIDER_USED_KEY);
    if (providerStored && ["anthropic", "openai", "gemini"].includes(providerStored)) {
      setProviderUsedState(providerStored as LLMProviderName);
    }
  }, []);

  useEffect(() => {
    if (result) {
      sessionStorage.setItem(OPTIMIZATION_STORAGE_KEY, JSON.stringify(result));
      return;
    }

    sessionStorage.removeItem(OPTIMIZATION_STORAGE_KEY);
  }, [result]);

  useEffect(() => {
    if (providerUsed) {
      sessionStorage.setItem(PROVIDER_USED_KEY, providerUsed);
      return;
    }
    sessionStorage.removeItem(PROVIDER_USED_KEY);
  }, [providerUsed]);

  useEffect(() => {
    if (companyResearch) {
      sessionStorage.setItem(
        COMPANY_RESEARCH_STORAGE_KEY,
        JSON.stringify(companyResearch),
      );
      return;
    }
    sessionStorage.removeItem(COMPANY_RESEARCH_STORAGE_KEY);
  }, [companyResearch]);

  useEffect(() => {
    if (coverLetter) {
      sessionStorage.setItem(
        COVER_LETTER_STORAGE_KEY,
        JSON.stringify(coverLetter),
      );
      return;
    }
    sessionStorage.removeItem(COVER_LETTER_STORAGE_KEY);
  }, [coverLetter]);

  useEffect(() => {
    sessionStorage.setItem(FORM_STATE_STORAGE_KEY, JSON.stringify(formState));
  }, [formState]);

  const setResult = useCallback(
    (nextResult: OptimizationResult, provider?: LLMProviderName): void => {
      setResultState(nextResult);
      if (provider) {
        setProviderUsedState(provider);
      }
    },
    [],
  );

  const clearResult = useCallback((): void => {
    setResultState(null);
    setProviderUsedState(null);
    setCoverLetterState(null);
  }, []);

  const setComparisonResult = useCallback((next: ComparisonResult | null): void => {
    setComparisonResultState(next);
  }, []);

  const setCompanyResearch = useCallback((nextResult: CompanyResearchResult | null): void => {
    setCompanyResearchState(nextResult);
  }, []);

  const setCoverLetter = useCallback((nextResult: CoverLetterResult | null): void => {
    setCoverLetterState(nextResult);
  }, []);

  const setFormState = useCallback((update: Partial<FormState>): void => {
    setFormStateRaw((prev) => ({ ...prev, ...update }));
  }, []);

  const clearFormState = useCallback((): void => {
    setFormStateRaw(DEFAULT_FORM_STATE);
  }, []);

  const value = useMemo(
    () => ({
      result,
      providerUsed,
      comparisonResult,
      companyResearch,
      coverLetter,
      formState,
      setResult,
      setComparisonResult,
      setCompanyResearch,
      setCoverLetter,
      clearResult,
      setFormState,
      clearFormState,
    }),
    [
      clearFormState,
      clearResult,
      companyResearch,
      coverLetter,
      comparisonResult,
      formState,
      providerUsed,
      result,
      setCompanyResearch,
      setComparisonResult,
      setCoverLetter,
      setFormState,
      setResult,
    ],
  );

  return <OptimizationContext.Provider value={value}>{children}</OptimizationContext.Provider>;
}

export function useOptimizationContext(): OptimizationContextValue {
  const context = useContext(OptimizationContext);
  if (!context) {
    throw new Error("useOptimizationContext must be used within OptimizationProvider.");
  }

  return context;
}
