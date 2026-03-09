/** Hook managing company research inputs, progress states, and API calls. */
import { useCallback, useEffect, useRef, useState } from "react";
import { useOptimizationContext } from "@/context/OptimizationContext";
import {
  checkResearchCache,
  fetchHistoryDetail,
  handleApiError,
  researchCompany,
} from "@/lib/api";
import type { CachedMatchInfo } from "@/types/history";
import type { CompanyResearchResult, ResearchStep } from "@/types/company";

interface UseCompanySearchOptions {
  userId?: string;
}

interface UseCompanySearchReturn {
  companyName: string;
  companyUrl: string;
  jobTitle: string;
  currentStep: ResearchStep;
  isLoading: boolean;
  error: string | null;
  result: CompanyResearchResult | null;
  cachedMatch: CachedMatchInfo | null;
  setCompanyName: (value: string) => void;
  setCompanyUrl: (value: string) => void;
  setJobTitle: (value: string) => void;
  startResearch: (forceRefresh?: boolean) => Promise<CompanyResearchResult>;
  loadCachedResearch: (match: CachedMatchInfo) => Promise<CompanyResearchResult>;
  dismissCachedBanner: () => void;
  clearError: () => void;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useCompanySearch(
  options?: UseCompanySearchOptions,
): UseCompanySearchReturn {
  const { formState, setFormState } = useOptimizationContext();

  const [companyName, setCompanyNameState] = useState<string>("");
  const [companyUrl, setCompanyUrlState] = useState<string>("");
  const [jobTitle, setJobTitleState] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<ResearchStep>("idle");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompanyResearchResult | null>(null);
  const [cachedMatch, setCachedMatch] = useState<CachedMatchInfo | null>(null);
  const checkCacheTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate local inputs from persisted form state once context finishes loading.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (formState.companyName || formState.companyUrl || formState.jobTitle) {
      setCompanyNameState(formState.companyName);
      setCompanyUrlState(formState.companyUrl);
      setJobTitleState(formState.jobTitle);
      hydratedRef.current = true;
    }
  }, [formState]);

  const setCompanyName = useCallback(
    (value: string): void => {
      setCompanyNameState(value);
      setFormState({ companyName: value });
    },
    [setFormState],
  );

  const setCompanyUrl = useCallback(
    (value: string): void => {
      setCompanyUrlState(value);
      setFormState({ companyUrl: value });
    },
    [setFormState],
  );

  const setJobTitle = useCallback(
    (value: string): void => {
      setJobTitleState(value);
      setFormState({ jobTitle: value });
    },
    [setFormState],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const dismissCachedBanner = useCallback(() => {
    setCachedMatch(null);
  }, []);

  const userId = options?.userId;

  useEffect(() => {
    if (!companyUrl.trim()) {
      setCachedMatch(null);
      return;
    }
    if (checkCacheTimeoutRef.current) {
      clearTimeout(checkCacheTimeoutRef.current);
    }
    checkCacheTimeoutRef.current = setTimeout(() => {
      void checkResearchCache(companyUrl.trim(), userId)
        .then((res) => {
          if (res.cached && res.match) {
            setCachedMatch(res.match);
          } else {
            setCachedMatch(null);
          }
        })
        .catch(() => {
          setCachedMatch(null);
        });
      checkCacheTimeoutRef.current = null;
    }, 500);
    return () => {
      if (checkCacheTimeoutRef.current) {
        clearTimeout(checkCacheTimeoutRef.current);
      }
    };
  }, [companyUrl, userId]);

  function isCompanyResearchResult(value: unknown): value is CompanyResearchResult {
    if (typeof value !== "object" || value === null) return false;
    const o = value as Record<string, unknown>;
    return (
      typeof o.profile === "object" &&
      typeof o.report === "object" &&
      Array.isArray(o.sources_used) &&
      typeof o.research_quality === "string" &&
      typeof o.researched_at === "string"
    );
  }

  const loadCachedResearch = useCallback(
    async (match: CachedMatchInfo): Promise<CompanyResearchResult> => {
      setCachedMatch(null);
      const detail = await fetchHistoryDetail(match.analysis_id, options?.userId);
      const json = detail.company_research_json;
      if (!json || !isCompanyResearchResult(json)) {
        throw new Error("Cached research data is invalid.");
      }
      setResult(json);
      setCurrentStep("done");
      return json;
    },
    [options?.userId],
  );

  const startResearch = useCallback(async (forceRefresh?: boolean): Promise<CompanyResearchResult> => {
    if (!companyName.trim() || isLoading) {
      throw new Error("Company name is required.");
    }

    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      setCurrentStep("scraping");
      await wait(800);
      setCurrentStep("searching");
      await wait(800);
      setCurrentStep("analyzing");

      const response = await researchCompany(
        {
          company_name: companyName.trim(),
          company_url: companyUrl.trim() || null,
          job_title: jobTitle.trim() || null,
        },
        { userId: options?.userId, forceRefresh },
      );

      setResult(response);
      setCurrentStep("done");
      return response;
    } catch (requestError: unknown) {
      const message = handleApiError(requestError);
      setError(message);
      setCurrentStep("error");
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [companyName, companyUrl, isLoading, jobTitle, options?.userId]);

  return {
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
  };
}
