/** Hook managing company research inputs, progress states, and API calls. */
import { useCallback, useState } from "react";
import { researchCompany } from "@/lib/api";
import type { CompanyResearchResult, ResearchStep } from "@/types/company";

interface UseCompanySearchReturn {
  companyName: string;
  companyUrl: string;
  jobTitle: string;
  currentStep: ResearchStep;
  isLoading: boolean;
  error: string | null;
  result: CompanyResearchResult | null;
  setCompanyName: (value: string) => void;
  setCompanyUrl: (value: string) => void;
  setJobTitle: (value: string) => void;
  startResearch: () => Promise<CompanyResearchResult>;
  clearError: () => void;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useCompanySearch(): UseCompanySearchReturn {
  const [companyName, setCompanyName] = useState<string>("");
  const [companyUrl, setCompanyUrl] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<ResearchStep>("idle");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompanyResearchResult | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startResearch = useCallback(async (): Promise<CompanyResearchResult> => {
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

      const response = await researchCompany({
        company_name: companyName.trim(),
        company_url: companyUrl.trim() || null,
        job_title: jobTitle.trim() || null,
      });

      setResult(response);
      setCurrentStep("done");
      return response;
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error ? requestError.message : "Company research failed.";
      setError(message);
      setCurrentStep("error");
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [companyName, companyUrl, isLoading, jobTitle]);

  return {
    companyName,
    companyUrl,
    jobTitle,
    currentStep,
    isLoading,
    error,
    result,
    setCompanyName,
    setCompanyUrl,
    setJobTitle,
    startResearch,
    clearError,
  };
}
