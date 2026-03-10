"use client";

/** Dropdown to select LLM provider for CV optimization. */
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <Select
        value={effectiveValue}
        onValueChange={(v) => onChange(v as LLMProviderName)}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-full max-w-xs"
          aria-label={t("selectProvider")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROVIDERS.map((name) => (
            <SelectItem
              key={name}
              value={name}
              disabled={!available.includes(name)}
            >
              {t(name)}
              {!available.includes(name) ? ` ${t("notConfigured")}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
