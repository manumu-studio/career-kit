/** Typed API client for backend optimization and history endpoints. */
import { env } from "@/lib/env";
import { ApiError, type ApiErrorBody } from "@/lib/api-errors";
import type {
  CompanyProfile,
  CompanyResearchRequest,
  CompanyResearchResult,
} from "@/types/company";
import type { OptimizationResult } from "@/types/optimization";
import type {
  CheckCacheResponse,
  HistoryDetailResponse,
  HistoryListParams,
  HistoryListResponse,
  HistoryStatsResponse,
} from "@/types/history";
import type { CoverLetterRequest, CoverLetterResult } from "@/types/cover-letter";
import type { ComparisonResult, ProvidersResponse } from "@/types/provider";

const RETRYABLE_STATUSES = [500, 502, 503, 504] as const;

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    const json = await response.json();
    body = json as ApiErrorBody;
  } catch {
    // Response body was not JSON
  }
  return new ApiError(response, body);
}

/** Retries transient 5xx failures with exponential backoff. */
async function fetchWithRetry(
  doFetch: () => Promise<Response>,
  retries: number = 1,
): Promise<Response> {
  let lastResponse: Response | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await doFetch();
    lastResponse = response;
    if (response.ok) return response;
    const isRetryable =
      RETRYABLE_STATUSES.includes(response.status as (typeof RETRYABLE_STATUSES)[number]) &&
      attempt < retries;
    if (isRetryable) {
      const delayMs = 1000 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      continue;
    }
    throw await parseErrorResponse(response);
  }
  throw await parseErrorResponse(lastResponse as Response);
}

const OPTIMIZE_ENDPOINT = "/optimize";
const COVER_LETTER_ENDPOINT = "/cover-letter";
const RESEARCH_ENDPOINT = "/research-company";
const PROVIDERS_ENDPOINT = "/providers";

interface OptimizeCompanyContext {
  companyName: string;
  companyProfile: CompanyProfile;
}

interface OptimizeCvOptions {
  companyContext?: OptimizeCompanyContext;
  userId?: string;
  forceRefresh?: boolean;
  provider?: string;
}

function buildOptimizeFormData(
  file: File,
  jobDescription: string,
  options?: OptimizeCvOptions,
): FormData {
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
  if (options?.forceRefresh) {
    formData.append("force_refresh", "true");
  }
  if (options?.provider) {
    formData.append("provider", options.provider);
  }
  return formData;
}

export async function optimizeCV(
  file: File,
  jobDescription: string,
  options?: OptimizeCvOptions,
): Promise<OptimizationResult> {
  const headers: Record<string, string> = {};
  if (options?.userId) {
    headers["X-User-Id"] = options.userId;
  }

  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${OPTIMIZE_ENDPOINT}`, {
      method: "POST",
      headers,
      body: buildOptimizeFormData(file, jobDescription, options),
    }),
  );

  return (await response.json()) as OptimizationResult;
}

export async function generateCoverLetter(
  request: CoverLetterRequest,
  userId?: string,
): Promise<CoverLetterResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (userId) {
    headers["X-User-Id"] = userId;
  }
  const body = JSON.stringify(request);

  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${COVER_LETTER_ENDPOINT}`, {
      method: "POST",
      headers,
      body,
    }),
  );

  return (await response.json()) as CoverLetterResult;
}

export async function getProviders(): Promise<ProvidersResponse> {
  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${PROVIDERS_ENDPOINT}`),
  );
  return (await response.json()) as ProvidersResponse;
}

export async function compareProviders(
  cvFile: File,
  jobDescription: string,
  providers: string[],
): Promise<ComparisonResult> {
  const response = await fetchWithRetry(() => {
    const formData = new FormData();
    formData.append("cv_file", cvFile);
    formData.append("job_description", jobDescription);
    formData.append("providers", providers.join(","));
    return fetch(`${env.NEXT_PUBLIC_API_URL}/compare`, {
      method: "POST",
      body: formData,
    });
  });

  return (await response.json()) as ComparisonResult;
}

interface ResearchCompanyOptions {
  userId?: string;
  forceRefresh?: boolean;
}

export async function researchCompany(
  request: CompanyResearchRequest,
  options?: ResearchCompanyOptions,
): Promise<CompanyResearchResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options?.userId) {
    headers["X-User-Id"] = options.userId;
  }

  const body: CompanyResearchRequest = {
    ...request,
    force_refresh: options?.forceRefresh ?? false,
  };

  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${RESEARCH_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  );

  return (await response.json()) as CompanyResearchResult;
}

const HISTORY_BASE = "/history";

function historyHeaders(userId?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (userId) {
    headers["X-User-Id"] = userId;
  }
  return headers;
}

export async function fetchHistoryList(
  params?: HistoryListParams,
  userId?: string,
): Promise<HistoryListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.company) searchParams.set("company", params.company);
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}${query ? `?${query}` : ""}`;

  const response = await fetchWithRetry(() =>
    fetch(url, { headers: historyHeaders(userId) }),
  );

  return (await response.json()) as HistoryListResponse;
}

export async function fetchHistoryDetail(
  id: string,
  userId?: string,
): Promise<HistoryDetailResponse> {
  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/${id}`, {
      headers: historyHeaders(userId),
    }),
  );

  return (await response.json()) as HistoryDetailResponse;
}

export async function fetchHistoryStats(userId?: string): Promise<HistoryStatsResponse> {
  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/stats`, {
      headers: historyHeaders(userId),
    }),
  );

  return (await response.json()) as HistoryStatsResponse;
}

export async function deleteHistoryEntry(
  id: string,
  userId?: string,
): Promise<void> {
  await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/${id}`, {
      method: "DELETE",
      headers: historyHeaders(userId),
    }),
  );
}

export async function checkResearchCache(
  companyUrl: string,
  userId?: string,
): Promise<CheckCacheResponse> {
  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/check-research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...historyHeaders(userId),
      },
      body: JSON.stringify({ company_url: companyUrl }),
    }),
  );

  return (await response.json()) as CheckCacheResponse;
}

export async function checkOptimizationCache(
  jobDescription: string,
  companyUrl?: string,
  userId?: string,
): Promise<CheckCacheResponse> {
  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/check-optimization`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...historyHeaders(userId),
      },
      body: JSON.stringify({
        job_description: jobDescription,
        company_url: companyUrl ?? null,
      }),
    }),
  );

  return (await response.json()) as CheckCacheResponse;
}

export async function clearAllHistory(userId?: string): Promise<void> {
  await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}`, {
      method: "DELETE",
      headers: historyHeaders(userId),
    }),
  );
}

export { ApiError, handleApiError } from "@/lib/api-errors";
