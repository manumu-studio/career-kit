/** Displays original and optimized CV sections side-by-side. */
"use client";

import { useTranslations } from "next-intl";
import type { CvComparisonProps } from "@/components/ui/CvComparison/CvComparison.types";
import { useCvComparison } from "@/components/ui/CvComparison/useCvComparison";

export function CvComparison({ sections }: Readonly<CvComparisonProps>) {
  const t = useTranslations("results");
  const { originalLabel, optimizedLabel, changesLabel } = useCvComparison(t);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{t("cvComparison")}</h2>
        <p className="text-sm text-slate-400">{t("cvComparisonSubtitle")}</p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <article
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            key={section.heading}
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-100">{section.heading}</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {originalLabel}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                  {section.original}
                </p>
              </div>
              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {optimizedLabel}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
                  {section.optimized}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {changesLabel}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                {section.changes_made.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
