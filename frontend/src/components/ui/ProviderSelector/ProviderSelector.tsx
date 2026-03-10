"use client";

/** Dropdown to select LLM provider for CV optimization. */
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { LLMProviderName } from "@/types/provider";
import type { ProviderSelectorProps } from "./ProviderSelector.types";

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
      <label className="block text-sm font-medium text-slate-300">
        {t("aiProvider")}
      </label>
      <select
        className={cn(
          "w-full max-w-xs rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200",
          "focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500",
          disabled && "cursor-not-allowed opacity-60",
        )}
        value={effectiveValue}
        onChange={(e) => onChange(e.target.value as LLMProviderName)}
        disabled={disabled}
        aria-label={t("selectProvider")}
      >
        {(["anthropic", "openai", "gemini"] as const).map((name) => (
          <option
            key={name}
            value={name}
            disabled={!available.includes(name)}
          >
            {t(name)}
            {!available.includes(name) ? ` ${t("notConfigured")}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
