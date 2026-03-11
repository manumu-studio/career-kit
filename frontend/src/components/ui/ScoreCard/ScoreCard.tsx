/** Renders job match score as a circular gauge card with interpretation. */
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import type { ScoreCardProps } from "@/components/ui/ScoreCard/ScoreCard.types";

function getInterpretationKey(score: number): "scoreStrong" | "scoreModerate" | "scoreLow" {
  if (score >= 71) return "scoreStrong";
  if (score >= 41) return "scoreModerate";
  return "scoreLow";
}

function getInterpretationColor(score: number): string {
  if (score >= 71) return "text-[var(--success)]";
  if (score >= 41) return "text-[var(--warning)]";
  return "text-[var(--destructive)]";
}

export function ScoreCard({ score }: Readonly<ScoreCardProps>) {
  const t = useTranslations("results");
  const interpretationKey = getInterpretationKey(score);

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("atsMatchScore")}
        </h2>
        <ScoreGauge score={score} size={180} label={t("scoreLabel")} />
        <p className={`mt-2 text-sm font-medium ${getInterpretationColor(score)}`}>
          {t(interpretationKey)}
        </p>
      </CardContent>
    </Card>
  );
}
