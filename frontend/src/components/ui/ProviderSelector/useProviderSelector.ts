"use client";

/** Hook to fetch providers and manage selection with localStorage persistence. */
import { useCallback, useEffect, useState } from "react";
import { getProviders, handleApiError } from "@/lib/api";
import type { LLMProviderName } from "@/types/provider";

const STORAGE_KEY = "ats-provider-preference";

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
          const valid =
            stored && data.available.includes(stored)
              ? (stored as LLMProviderName)
              : data.available.includes(data.default)
                ? (data.default as LLMProviderName)
                : (data.available[0] as LLMProviderName);
          setSelected(valid);
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
