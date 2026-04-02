/** Renders skill gaps as accordion items with severity badges and suggestions. */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

      <Accordion multiple className="space-y-2">
        {sortedGaps.map((gap) => {
          const id = `${gap.skill}-${gap.importance}`;
          return (
            <AccordionItem key={id} value={id} className="rounded-lg border border-border">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-foreground">{gap.skill}</span>
                  <Badge
                    variant="outline"
                    className={cn("border", SEVERITY_BADGE_CLASSES[gap.importance])}
                  >
                    {t(SEVERITY_KEYS[gap.importance])}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{gap.suggestion}</p>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
