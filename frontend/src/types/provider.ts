/** LLM provider types for multi-provider support. */

export type { ComparisonResult, ProvidersResponse } from "@/lib/schemas/provider.schema";

export type LLMProviderName = "anthropic" | "openai" | "gemini";

export interface ProviderInfo {
  name: LLMProviderName;
  displayName: string;
  model: string;
  speedTier: "fast" | "medium" | "slow";
  costTier: "$" | "$$" | "$$$";
}
