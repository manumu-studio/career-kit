"use client";

/** Hook to fetch providers and manage selection with localStorage persistence. */
import { useCallback, useEffect, useState } from "react";
import { getProviders, handleApiError } from "@/lib/api";
import type { LLMProviderName } from "@/types/provider";

const STORAGE_KEY = "ats-provider-preference";

const LLM_PROVIDER_IDS: readonly LLMProviderName[] = ["anthropic", "openai", "gemini"];

function isLLMProviderName(value: string): value is LLMProviderName {
  return LLM_PROVIDER_IDS.some((id) => id === value);
}

export function useProviderSelector() {
  const [available, setAvailable] = useState<string[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<string>("anthropic");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<LLMProviderName | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProviders()
      .then((data) => {
        if (!cancelled) {
          setAvailable(data.available);
          setDefaultProvider(data.default);
          const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
          let next: LLMProviderName | null = null;
          if (stored && data.available.includes(stored) && isLLMProviderName(stored)) {
            next = stored;
          } else if (
            data.available.includes(data.default) &&
            isLLMProviderName(data.default)
          ) {
            next = data.default;
          } else {
            const first = data.available[0];
            if (first && isLLMProviderName(first)) {
              next = first;
            }
          }
          setSelected(next ?? "anthropic");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(handleApiError(err));
          setAvailable(["anthropic"]);
          setDefaultProvider("anthropic");
          setSelected("anthropic");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onChange = useCallback((provider: LLMProviderName) => {
    setSelected(provider);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, provider);
    }
  }, []);

  return {
    available,
    defaultProvider,
    selected,
    onChange,
    loading,
    error,
  };
}
