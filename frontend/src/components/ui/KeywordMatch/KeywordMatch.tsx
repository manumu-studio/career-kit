/** Displays matched and missing keywords with summary counts, tooltips, and stagger animation. */
"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { KeywordMatchProps } from "@/components/ui/KeywordMatch/KeywordMatch.types";
import { useKeywordMatch } from "@/components/ui/KeywordMatch/useKeywordMatch";

const CHIP_STAGGER = 0.05;

function KeywordChip({
  keyword,
  variant,
  index,
  reducedMotion,
}: {
  keyword: string;
  variant: "matched" | "missing";
  index: number;
  reducedMotion: boolean | null;
}) {
  const isMatched = variant === "matched";
  const className = isMatched
    ? "rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
    : "rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-400";

  return (
    <Tooltip>
      <TooltipTrigger className="cursor-default border-none bg-transparent p-0">
        <motion.span
          className={className}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reducedMotion ? { duration: 0 } : { delay: index * CHIP_STAGGER, duration: 0.2 }
          }
        >
          {keyword}
        </motion.span>
      </TooltipTrigger>
      <TooltipContent side="top">{keyword}</TooltipContent>
    </Tooltip>
  );
}

export function KeywordMatch({ matches, misses }: Readonly<KeywordMatchProps>) {
  const t = useTranslations("results");
  const reducedMotion = useReducedMotion();
  const { matchedCount, totalKeywords } = useKeywordMatch({ matches, misses });
  const summaryLabel = t("keywordsMatched", { matched: matchedCount, total: totalKeywords });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{t("keywordMatch")}</h2>
        <p className="text-sm text-muted-foreground">{summaryLabel}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              {t("matchedKeywords", { count: matchedCount })}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {matches.map((keyword, i) => (
                <KeywordChip
                  key={keyword}
                  keyword={keyword}
                  variant="matched"
                  index={i}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
              {t("missingKeywords", { count: totalKeywords - matchedCount })}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {misses.map((keyword, i) => (
                <KeywordChip
                  key={keyword}
                  keyword={keyword}
                  variant="missing"
                  index={i}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
