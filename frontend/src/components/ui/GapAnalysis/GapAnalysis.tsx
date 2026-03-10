/** Renders skill gaps as cards with severity badges and expandable suggestions. */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GapAnalysisProps } from "@/components/ui/GapAnalysis/GapAnalysis.types";
import {
  useGapAnalysis,
  SEVERITY_KEYS,
  SEVERITY_BADGE_CLASSES,
  type SortMode,
} from "@/components/ui/GapAnalysis/useGapAnalysis";

export function GapAnalysis({ gaps }: Readonly<GapAnalysisProps>) {
  const t = useTranslations("results");
  const [sortMode, setSortMode] = useState<SortMode>("severity");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const { sortedGaps } = useGapAnalysis(gaps, sortMode);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{t("gapAnalysis")}</h2>
        <p className="text-sm text-muted-foreground">{t("gapSubtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Button
          variant={sortMode === "severity" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortMode("severity")}
        >
          {t("sortBySeverity")}
        </Button>
        <Button
          variant={sortMode === "name" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortMode("name")}
        >
          {t("sortByName")}
        </Button>
      </div>

      <div className="space-y-3">
        {sortedGaps.map((gap) => {
          const id = `${gap.skill}-${gap.importance}`;
          const isExpanded = expandedId === id;
          return (
            <Card
              key={id}
              className="cursor-pointer transition-colors hover:bg-muted/30"
              onClick={() => setExpandedId(isExpanded ? null : id)}
            >
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-foreground">{gap.skill}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border",
                      SEVERITY_BADGE_CLASSES[gap.importance],
                    )}
                  >
                    {t(SEVERITY_KEYS[gap.importance])}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {gap.suggestion}
                </p>
                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <motion.div
                      initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={reducedMotion ? {} : { height: "auto", opacity: 1 }}
                      exit={reducedMotion ? {} : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-foreground">
                        {gap.suggestion}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
