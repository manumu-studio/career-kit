"use client";

/** Pill/segment selector for LLM provider used in CV optimization. */
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { LLMProviderName } from "@/types/provider";
import type { ProviderSelectorProps } from "./ProviderSelector.types";

const PROVIDERS: readonly LLMProviderName[] = [
  "anthropic",
  "openai",
  "gemini",
] as const;

export function ProviderSelector({
  value,
  onChange,
  available,
  defaultProvider,
  disabled,
}: ProviderSelectorProps) {
  const t = useTranslations("providers");
  const effectiveValue = value ?? (defaultProvider as LLMProviderName);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {t("aiProvider")}
      </label>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t("selectProvider")}
      >
        {PROVIDERS.map((name) => {
          const isAvailable = available.includes(name);
          const isSelected = effectiveValue === name;
          return (
            <button
              key={name}
              type="button"
              disabled={disabled || !isAvailable}
              aria-pressed={isSelected}
              aria-label={`${t(name)}${!isAvailable ? ` ${t("notConfigured")}` : ""}`}
              onClick={() => isAvailable && onChange(name)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {t(name)}
              {!isAvailable ? ` ${t("notConfigured")}` : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
