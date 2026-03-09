"use client";

/** Badge showing which LLM provider was used for the current result. */
import { cn } from "@/lib/utils";
import type { LLMProviderName } from "@/types/provider";
import type { ProviderBadgeProps } from "./ProviderBadge.types";

const PROVIDER_LABELS: Record<LLMProviderName, string> = {
  anthropic: "Claude",
  openai: "GPT-4o",
  gemini: "Gemini",
};

export function ProviderBadge({ provider }: ProviderBadgeProps) {
  const label = PROVIDER_LABELS[provider] ?? provider;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-slate-700/80 text-slate-200",
      )}
      title={`Optimized with ${label}`}
    >
      {label}
    </span>
  );
}
