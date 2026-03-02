/** Typed API client for backend optimization endpoints. */
import { env } from "@/lib/env";
import type {
  CompanyProfile,
  CompanyResearchRequest,
  CompanyResearchResult,
} from "@/types/company";
import type { OptimizationResult } from "@/types/optimization";

interface OptimizeCvErrorBody {
  detail?: string;
}

const OPTIMIZE_ENDPOINT = "/optimize";
const RESEARCH_ENDPOINT = "/research-company";

interface OptimizeCompanyContext {
  companyName: string;
  companyProfile: CompanyProfile;
}

interface OptimizeCvOptions {
  companyContext?: OptimizeCompanyContext;
}

export async function optimizeCV(
  file: File,
  jobDescription: string,
  options?: OptimizeCvOptions,
): Promise<OptimizationResult> {
  const formData = new FormData();
  formData.append("cv_file", file);
  formData.append("job_description", jobDescription);
  if (options?.companyContext) {
    formData.append("company_name", options.companyContext.companyName);
    formData.append(
      "company_profile_json",
      JSON.stringify(options.companyContext.companyProfile),
    );
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${OPTIMIZE_ENDPOINT}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = `Optimization request failed (${response.status})`;

    try {
      const errorBody = (await response.json()) as OptimizeCvErrorBody;
      if (typeof errorBody.detail === "string" && errorBody.detail.length > 0) {
        detail = errorBody.detail;
      }
    } catch {
      // Preserve default message when response body is not JSON.
    }

    throw new Error(detail);
  }

  return (await response.json()) as OptimizationResult;
}

export async function researchCompany(
  request: CompanyResearchRequest,
): Promise<CompanyResearchResult> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${RESEARCH_ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Research failed: ${response.status}`);
  }

  return (await response.json()) as CompanyResearchResult;
}
