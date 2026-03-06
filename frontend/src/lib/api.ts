/** Typed API client for backend optimization and history endpoints. */
import { env } from "@/lib/env";
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
  userId?: string;
  forceRefresh?: boolean;
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
  if (options?.forceRefresh) {
    formData.append("force_refresh", "true");
  }

  const headers: Record<string, string> = {};
  if (options?.userId) {
    headers["X-User-Id"] = options.userId;
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${OPTIMIZE_ENDPOINT}`, {
    method: "POST",
    headers,
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

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${RESEARCH_ENDPOINT}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Research failed: ${response.status}`);
  }

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

  const response = await fetch(url, {
    headers: historyHeaders(userId),
  });

  if (!response.ok) {
    throw new Error(`History list failed: ${response.status}`);
  }

  return (await response.json()) as HistoryListResponse;
}

export async function fetchHistoryDetail(
  id: string,
  userId?: string,
): Promise<HistoryDetailResponse> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/${id}`,
    { headers: historyHeaders(userId) },
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Analysis not found.");
    }
    throw new Error(`History detail failed: ${response.status}`);
  }

  return (await response.json()) as HistoryDetailResponse;
}

export async function fetchHistoryStats(userId?: string): Promise<HistoryStatsResponse> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/stats`,
    { headers: historyHeaders(userId) },
  );

  if (!response.ok) {
    throw new Error(`History stats failed: ${response.status}`);
  }

  return (await response.json()) as HistoryStatsResponse;
}

export async function deleteHistoryEntry(
  id: string,
  userId?: string,
): Promise<void> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/${id}`,
    {
      method: "DELETE",
      headers: historyHeaders(userId),
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Analysis not found.");
    }
    throw new Error(`Delete failed: ${response.status}`);
  }
}

export async function checkResearchCache(
  companyUrl: string,
  userId?: string,
): Promise<CheckCacheResponse> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/check-research`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...historyHeaders(userId),
      },
      body: JSON.stringify({ company_url: companyUrl }),
    },
  );

  if (!response.ok) {
    throw new Error(`Cache check failed: ${response.status}`);
  }

  return (await response.json()) as CheckCacheResponse;
}

export async function checkOptimizationCache(
  jobDescription: string,
  companyUrl?: string,
  userId?: string,
): Promise<CheckCacheResponse> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}/check-optimization`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...historyHeaders(userId),
      },
      body: JSON.stringify({
        job_description: jobDescription,
        company_url: companyUrl ?? null,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Cache check failed: ${response.status}`);
  }

  return (await response.json()) as CheckCacheResponse;
}

export async function clearAllHistory(userId?: string): Promise<void> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${HISTORY_BASE}`, {
    method: "DELETE",
    headers: historyHeaders(userId),
  });

  if (!response.ok) {
    throw new Error(`Clear history failed: ${response.status}`);
  }
}
