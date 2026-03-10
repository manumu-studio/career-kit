/** API error types and user-friendly message mapping. */

export interface ApiErrorBody {
  error?: string;
  detail?: string;
  code?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly rawMessage: string;

  constructor(
    response: Response,
    body?: ApiErrorBody | null,
  ) {
    const message =
      (body?.error ?? body?.detail ?? `Request failed (${response.status})`) as string;
    super(message);
    this.name = "ApiError";
    this.status = response.status;
    this.code = body?.code ?? null;
    this.rawMessage = message;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/** Generic fallback error message (English) — use for i18n matching. */
export const GENERIC_ERROR_EN = "Something went wrong. Please try again.";

/** Maps API error codes and messages to user-friendly strings. */
export function handleApiError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return GENERIC_ERROR_EN;
  }

  const msg = error.rawMessage.toLowerCase();
  const code = error.code?.toLowerCase();

  if (code === "file_too_large" || msg.includes("5mb") || msg.includes("file size")) {
    return "Your PDF exceeds the 5MB limit. Please upload a smaller file.";
  }
  if (
    code === "invalid_pdf" ||
    msg.includes("must be a pdf") ||
    msg.includes("pdf")
  ) {
    return "The file doesn't appear to be a valid PDF.";
  }
  if (
    code === "llm_error" ||
    msg.includes("llm") ||
    msg.includes("provider") ||
    msg.includes("ai service")
  ) {
    return "Our AI service is temporarily unavailable. Please try again.";
  }
  if (error.status === 404 && msg.includes("not found")) {
    return "The requested resource was not found.";
  }
  if (error.status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  if (error.status >= 500) {
    return "Our servers are temporarily unavailable. Please try again.";
  }

  if (error.rawMessage && error.rawMessage.length > 0 && error.rawMessage.length < 200) {
    return error.rawMessage;
  }

  return GENERIC_ERROR_EN;
}
