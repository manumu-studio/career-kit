/** Types for ProviderSelector component. */

import type { LLMProviderName } from "@/types/provider";

export interface ProviderSelectorProps {
  value: LLMProviderName | null;
  onChange: (provider: LLMProviderName) => void;
  available: string[];
  defaultProvider: string;
  disabled?: boolean;
}
