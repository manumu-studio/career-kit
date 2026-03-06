"use client";

/** Side-by-side comparison of two optimization results for the same job description. */
import { cn } from "@/lib/utils";
import type { ComparisonViewProps } from "./ComparisonView.types";

export function ComparisonView({
  resultA,
  resultB,
  labelA = "Version A",
  labelB = "Version B",
  className,
}: ComparisonViewProps) {
  const sectionHeadings = new Set([
    ...resultA.sections.map((s) => s.heading),
    ...resultB.sections.map((s) => s.heading),
  ]);

  return (
    <section className={cn("space-y-6", className)}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{labelA}</h2>
            <span className="rounded-full bg-sky-500/20 px-3 py-1 text-sm font-medium text-sky-300">
              {resultA.match_score}% ATS
            </span>
          </div>
          <p className="text-sm text-slate-300">{resultA.summary}</p>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Keyword matches
            </p>
            <p className="text-sm text-slate-200">
              {resultA.keyword_matches.length} matches, {resultA.keyword_misses.length} misses
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{labelB}</h2>
            <span className="rounded-full bg-sky-500/20 px-3 py-1 text-sm font-medium text-sky-300">
              {resultB.match_score}% ATS
            </span>
          </div>
          <p className="text-sm text-slate-300">{resultB.summary}</p>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Keyword matches
            </p>
            <p className="text-sm text-slate-200">
              {resultB.keyword_matches.length} matches, {resultB.keyword_misses.length} misses
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-white">Section comparison</h3>
        <div className="space-y-6">
          {Array.from(sectionHeadings).map((heading) => {
            const sectionA = resultA.sections.find((s) => s.heading === heading);
            const sectionB = resultB.sections.find((s) => s.heading === heading);

            return (
              <article
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
                key={heading}
              >
                <h4 className="mb-4 text-base font-semibold text-slate-100">{heading}</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {labelA}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                      {sectionA?.optimized ?? sectionA?.original ?? "—"}
                    </p>
                  </div>
                  <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {labelB}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                      {sectionB?.optimized ?? sectionB?.original ?? "—"}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
