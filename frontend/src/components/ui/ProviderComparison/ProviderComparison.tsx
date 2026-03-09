"use client";

/** Side-by-side comparison of optimization results from multiple LLM providers. */
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { OptimizationResult } from "@/types/optimization";
import type { ProviderComparisonProps } from "./ProviderComparison.types";

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Claude",
  openai: "GPT-4o",
  gemini: "Gemini",
};

function isErrorResult(
  r: OptimizationResult | { error: string },
): r is { error: string } {
  return "error" in r && typeof (r as { error: string }).error === "string";
}

export function ProviderComparison({ data }: ProviderComparisonProps) {
  const providerNames = Object.keys(data.results);
  const { score_delta, unique_keywords, processing_time_ms } = data.comparison;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Provider Comparison</h2>
        <Link
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500"
          href="/home"
        >
          Back to Upload
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providerNames.map((name) => {
          const result = data.results[name];
          const score = score_delta[name] ?? 0;
          const unique = unique_keywords[name] ?? [];
          const timeMs = processing_time_ms[name] ?? 0;

          if (result === undefined) {
            return (
              <div
                key={name}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <span className="font-medium text-slate-200">
                  {PROVIDER_LABELS[name] ?? name}
                </span>
                <p className="mt-2 text-sm text-slate-500">No result</p>
              </div>
            );
          }

          return (
            <div
              key={name}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-slate-200">
                  {PROVIDER_LABELS[name] ?? name}
                </span>
                <span className="text-xs text-slate-400">{timeMs}ms</span>
              </div>

              {isErrorResult(result) ? (
                <p className="text-sm text-rose-400">{result.error}</p>
              ) : (
                <>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-sky-400">{score}</span>
                    <span className="ml-1 text-sm text-slate-400">/ 100</span>
                  </div>
                  <p className="mb-3 line-clamp-3 text-sm text-slate-300">
                    {result.summary}
                  </p>
                  {unique.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-400">
                        Unique keywords
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {unique.slice(0, 5).map((kw) => (
                          <span
                            key={kw}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-xs",
                              "bg-sky-500/20 text-sky-300",
                            )}
                          >
                            {kw}
                          </span>
                        ))}
                        {unique.length > 5 ? (
                          <span className="text-xs text-slate-500">
                            +{unique.length - 5} more
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
