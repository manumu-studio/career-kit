/** Typed API client for backend optimization and history endpoints. */
import { z } from "zod";
import { env } from "@/lib/env";
import { ApiError, type ApiErrorBody } from "@/lib/api-errors";
import {
  ApiErrorBodySchema,
  CheckCacheResponseSchema,
  CompanyResearchResultSchema,
  ComparisonResultSchema,
  CoverLetterResultSchema,
  HistoryDetailResponseSchema,
  HistoryListResponseSchema,
  HistoryStatsResponseSchema,
  OptimizationResultSchema,
  ProvidersResponseSchema,
} from "@/lib/schemas";
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

function parseApiResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string,
): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid API response (${context})`);
  }
  return parsed.data;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    const json: unknown = await response.json();
    const parsed = ApiErrorBodySchema.safeParse(json);
    body = parsed.success ? parsed.data : null;
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

type Locale = "en" | "es";

export interface OptimizeCvOptions {
  companyContext?: OptimizeCompanyContext;
  userId?: string;
  forceRefresh?: boolean;
  provider?: string;
  language?: Locale;
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

  const raw: unknown = await response.json();
  return parseApiResponse(OptimizationResultSchema, raw, "optimization");
}

export async function generateCoverLetter(
  request: CoverLetterRequest,
  userId?: string,
): Promise<CoverLetterResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (userId) {
    headers["X-User-Id"] = userId;
  }
  const body = JSON.stringify({
    ...request,
    language: request.language ?? "en",
  });

  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${COVER_LETTER_ENDPOINT}`, {
      method: "POST",
      headers,
      body,
    }),
  );

  const raw: unknown = await response.json();
  return parseApiResponse(CoverLetterResultSchema, raw, "cover letter");
}

export async function getProviders(): Promise<ProvidersResponse> {
  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${PROVIDERS_ENDPOINT}`),
  );
  const raw: unknown = await response.json();
  return parseApiResponse(ProvidersResponseSchema, raw, "providers list");
}

export async function compareProviders(
  cvFile: File,
  jobDescription: string,
  providers: string[],
  language?: Locale,
): Promise<ComparisonResult> {
  const response = await fetchWithRetry(() => {
    const formData = new FormData();
    formData.append("cv_file", cvFile);
    formData.append("job_description", jobDescription);
    formData.append("providers", providers.join(","));
    if (language) {
      formData.append("language", language);
    }
    return fetch(`${env.NEXT_PUBLIC_API_URL}/compare`, {
      method: "POST",
      body: formData,
    });
  });

  const raw: unknown = await response.json();
  return parseApiResponse(ComparisonResultSchema, raw, "provider comparison");
}

export interface ResearchCompanyOptions {
  userId?: string;
  forceRefresh?: boolean;
  language?: Locale;
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
    language: options?.language ?? request.language ?? "en",
  };

  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${RESEARCH_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  );

  const raw: unknown = await response.json();
  return parseApiResponse(CompanyResearchResultSchema, raw, "company research");
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

  const raw: unknown = await response.json();
  return parseApiResponse(HistoryListResponseSchema, raw, "history list");
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

  const raw: unknown = await response.json();
  return parseApiResponse(HistoryDetailResponseSchema, raw, "history detail");
}

export async function fetchHistoryStats(userId?: string): Promise<HistoryStatsResponse> {
  const response = await fetchWithRetry(() =>
    fetch(`${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/stats`, {
      headers: historyHeaders(userId),
    }),
  );

  const raw: unknown = await response.json();
  return parseApiResponse(HistoryStatsResponseSchema, raw, "history stats");
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

  const raw: unknown = await response.json();
  return parseApiResponse(CheckCacheResponseSchema, raw, "research cache check");
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

  const raw: unknown = await response.json();
  return parseApiResponse(CheckCacheResponseSchema, raw, "optimization cache check");
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
