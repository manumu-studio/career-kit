/** Renders skill gaps with importance badges and suggestions. */
import type { GapAnalysisProps } from "@/components/ui/GapAnalysis/GapAnalysis.types";
import { useGapAnalysis } from "@/components/ui/GapAnalysis/useGapAnalysis";

export function GapAnalysis({ gaps }: Readonly<GapAnalysisProps>) {
  const { sortedGaps, getBadgeClassName } = useGapAnalysis(gaps);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Gap Analysis</h2>
        <p className="text-sm text-slate-400">Prioritized skills to strengthen for this role.</p>
      </div>

      <div className="space-y-3">
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
