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
import type { OptimizationResult } from "@/types/optimization";

const OPTIMIZATION_STORAGE_KEY = "optimization-result-v1";
const COMPANY_RESEARCH_STORAGE_KEY = "ats-company-research";

interface OptimizationContextValue {
  result: OptimizationResult | null;
  companyResearch: CompanyResearchResult | null;
  setResult: (result: OptimizationResult) => void;
  setCompanyResearch: (result: CompanyResearchResult | null) => void;
  clearResult: () => void;
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
  const [companyResearch, setCompanyResearchState] =
    useState<CompanyResearchResult | null>(null);

  // Hydrate latest result from session storage after initial mount.
  useEffect(() => {
    const optimizationStored = sessionStorage.getItem(OPTIMIZATION_STORAGE_KEY);
    if (optimizationStored) {
      try {
        const parsed: unknown = JSON.parse(optimizationStored);
        if (isOptimizationResult(parsed)) {
          setResultState(parsed);
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
  }, []);

  useEffect(() => {
    if (result) {
      sessionStorage.setItem(OPTIMIZATION_STORAGE_KEY, JSON.stringify(result));
      return;
    }

    sessionStorage.removeItem(OPTIMIZATION_STORAGE_KEY);
  }, [result]);

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

  const setResult = useCallback((nextResult: OptimizationResult): void => {
    setResultState(nextResult);
  }, []);

  const clearResult = useCallback((): void => {
    setResultState(null);
  }, []);

  const setCompanyResearch = useCallback((nextResult: CompanyResearchResult | null): void => {
    setCompanyResearchState(nextResult);
  }, []);

  const value = useMemo(
    () => ({
      result,
      companyResearch,
      setResult,
      setCompanyResearch,
      clearResult,
    }),
    [clearResult, companyResearch, result, setCompanyResearch, setResult],
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
