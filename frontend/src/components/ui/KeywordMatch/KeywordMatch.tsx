/** Displays matched and missing keywords with summary counts. */
"use client";

import { useTranslations } from "next-intl";
import type { KeywordMatchProps } from "@/components/ui/KeywordMatch/KeywordMatch.types";
import { useKeywordMatch } from "@/components/ui/KeywordMatch/useKeywordMatch";

export function KeywordMatch({ matches, misses }: Readonly<KeywordMatchProps>) {
  const t = useTranslations("results");
  const { matchedCount, totalKeywords } = useKeywordMatch({ matches, misses });
  const summaryLabel = t("keywordsMatched", { matched: matchedCount, total: totalKeywords });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{t("keywordMatch")}</h2>
        <p className="text-sm text-slate-400">{summaryLabel}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            {t("matchedKeywords", { count: matchedCount })}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {matches.map((keyword) => (
              <span
                className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-100"
                key={keyword}
              >
                {keyword}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-300">
            {t("missingKeywords", { count: totalKeywords - matchedCount })}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {misses.map((keyword) => (
              <span
                className="rounded-full border border-rose-500/40 bg-rose-500/20 px-2.5 py-1 text-xs text-rose-100"
                key={keyword}
              >
                {keyword}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
