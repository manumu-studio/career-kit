/** Renders job match score as a circular gauge card (same layout as landing page). */
"use client";

import { useTranslations } from "next-intl";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import type { ScoreCardProps } from "@/components/ui/ScoreCard/ScoreCard.types";

export function ScoreCard({ score }: Readonly<ScoreCardProps>) {
  const t = useTranslations("results");

  return (
    <article className="w-full rounded-2xl border border-border bg-card p-4 md:mx-auto md:max-w-xs md:p-6 lg:mx-0 lg:max-w-none">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t("scoreLabel")}
      </h2>
      <div className="flex flex-col items-center justify-center">
        <ScoreGauge score={score} size={140} label={t("scoreLabel")} />
      </div>
    </article>
  );
}
