"use client";

/** Checkboxes and run button for comparing multiple LLM providers on the same CV. */
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { CompareProvidersPanelProps } from "./CompareProvidersPanel.types";

const COMPARE_PROVIDER_NAMES = ["anthropic", "openai", "gemini"] as const;

export function CompareProvidersPanel({
  availableProviders,
  selectedProviders,
  onToggle,
  onCompare,
  isComparing,
  isReadyToSubmit,
}: CompareProvidersPanelProps) {
  const t = useTranslations("home");

  return (
    <div className="mt-3 space-y-3">
      <p className="text-sm text-muted-foreground">{t("compareDesc")}</p>
      <div className="flex flex-wrap gap-4">
        {COMPARE_PROVIDER_NAMES.map((name) => (
          <label
            key={name}
            className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
          >
            <input
              checked={selectedProviders.has(name)}
              disabled={!availableProviders.includes(name)}
              onChange={() => onToggle(name)}
              type="checkbox"
            />
            {name}
            {!availableProviders.includes(name) ? ` ${t("notConfigured")}` : ""}
          </label>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={!isReadyToSubmit || isComparing || selectedProviders.size < 2}
        onClick={() => void onCompare()}
      >
        {isComparing ? t("comparing") : t("runComparison")}
      </Button>
    </div>
  );
}
