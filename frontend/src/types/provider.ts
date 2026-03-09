/** LLM provider types for multi-provider support. */

import type { OptimizationResult } from "@/types/optimization";

export type LLMProviderName = "anthropic" | "openai" | "gemini";

export interface ProviderInfo {
  name: LLMProviderName;
  displayName: string;
  model: string;
  speedTier: "fast" | "medium" | "slow";
  costTier: "$" | "$$" | "$$$";
}

export interface ProvidersResponse {
  available: string[];
  default: string;
}

export interface ComparisonResult {
  results: Record<string, OptimizationResult | { error: string }>;
  comparison: {
    score_delta: Record<string, number>;
    unique_keywords: Record<string, string[]>;
    processing_time_ms: Record<string, number>;
  };
}
