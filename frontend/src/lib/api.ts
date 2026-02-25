/** Typed API client for backend optimization endpoints. */
import { env } from "@/lib/env";
import type { OptimizationResult } from "@/types/optimization";

interface OptimizeCvErrorBody {
  detail?: string;
}

const OPTIMIZE_ENDPOINT = "/optimize";

export async function optimizeCV(
  file: File,
  jobDescription: string,
): Promise<OptimizationResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);

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
