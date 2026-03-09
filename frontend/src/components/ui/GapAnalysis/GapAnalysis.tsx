/** Renders skill gaps with importance badges and suggestions. */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { GapAnalysisProps } from "@/components/ui/GapAnalysis/GapAnalysis.types";
import { useGapAnalysis } from "@/components/ui/GapAnalysis/useGapAnalysis";

export function GapAnalysis({ gaps }: Readonly<GapAnalysisProps>) {
  const { sortedGaps, getBadgeClassName } = useGapAnalysis(gaps);
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between md:block">
        <div>
          <h2 className="text-xl font-semibold text-white">Gap Analysis</h2>
          <p className="text-sm text-slate-400">
            Prioritized skills to strengthen for this role.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-300 md:hidden"
          aria-expanded={expanded}
          aria-controls="gap-analysis-list"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      <div
        id="gap-analysis-list"
        className={cn("space-y-3", expanded ? "block" : "hidden", "md:block")}
      >
        {sortedGaps.map((gap) => (
          <article
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            key={`${gap.skill}-${gap.importance}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-slate-100">{gap.skill}</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getBadgeClassName(gap.importance)}`}
              >
                {gap.importance.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{gap.suggestion}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
