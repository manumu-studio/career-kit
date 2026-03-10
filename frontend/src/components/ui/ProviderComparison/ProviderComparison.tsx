"use client";

/** Side-by-side comparison of optimization results from multiple LLM providers. */
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { cn } from "@/lib/utils";
import type { OptimizationResult } from "@/types/optimization";
import type { LLMProviderName } from "@/types/provider";
import type { ProviderComparisonProps } from "./ProviderComparison.types";
import {
  SEVERITY_KEYS,
  SEVERITY_BADGE_CLASSES,
} from "@/components/ui/GapAnalysis/useGapAnalysis";

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Claude",
  openai: "GPT-4o",
  gemini: "Gemini",
};

const DESKTOP_BREAKPOINT = 1024;
const STAGGER_DELAY = 0.1;

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const handler = () => setIsDesktop(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

function isErrorResult(
  r: OptimizationResult | { error: string } | undefined,
): r is { error: string } {
  return r != null && "error" in r && typeof (r as { error: string }).error === "string";
}

function getScoreBarColor(score: number): string {
  if (score <= 40) return "bg-destructive";
  if (score <= 70) return "bg-warning";
  return "bg-success";
}

export function ProviderComparison({ data }: ProviderComparisonProps) {
  const t = useTranslations("providerCompare");
  const tResults = useTranslations("results");
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();

  const providerNames = Object.keys(data.results);
  const validProviders = providerNames.filter(
    (name) => name in data.results,
  ) as string[];
  const successProviders = validProviders.filter((name) => {
    const r = data.results[name];
    return r !== undefined && !isErrorResult(r);
  });

  const [activeTab, setActiveTab] = useState<string>(validProviders[0] ?? "");

  const { score_delta, unique_keywords } = data.comparison;

  // Keyword overlap: found by all vs found by only one
  const keywordStats = (() => {
    if (successProviders.length < 2) return null;
    const allMatches = successProviders.map(
      (n) => (data.results[n] as OptimizationResult).keyword_matches,
    );
    const allKeywords = new Set<string>();
    allMatches.forEach((arr) => arr.forEach((kw) => allKeywords.add(kw)));
    const inAll = [...allKeywords].filter((kw) =>
      allMatches.every((arr) => arr.includes(kw)),
    );
    const onlyOneCount = successProviders.reduce(
      (sum, n) => sum + (unique_keywords[n] ?? []).length,
      0,
    );
    return { inAllCount: inAll.length, onlyOneCount };
  })();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : STAGGER_DELAY,
      },
    },
  };

  const itemVariants = {
    hidden: reducedMotion ? {} : { opacity: 0, y: 12 },
    visible: reducedMotion ? {} : { opacity: 1, y: 0 },
  };

  if (providerNames.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
          <Link
            className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
            href="/home"
          >
            {t("backToUpload")}
          </Link>
        </div>
        <p className="text-muted-foreground">{t("runComparisonCta")}</p>
      </div>
    );
  }

  const colsClass =
    successProviders.length === 2
      ? "lg:grid-cols-2"
      : successProviders.length >= 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-1";

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
          href="/home"
        >
          {t("backToUpload")}
        </Link>
      </div>

      {/* Score comparison bar chart */}
      <motion.section variants={itemVariants} className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">{t("scoreChart")}</h2>
        <div className="space-y-3">
          {validProviders.map((name) => {
            const res = data.results[name];
            const score =
              !res || isErrorResult(res)
                ? 0
                : score_delta[name] ?? (res as OptimizationResult).match_score ?? 0;
            const clamped = Math.min(100, Math.max(0, Math.round(score)));
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm font-medium text-foreground">
                  {PROVIDER_LABELS[name] ?? name}
                </span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative h-6 flex flex-1 overflow-hidden rounded-md bg-muted/50">
                    <motion.div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-md",
                        getScoreBarColor(clamped),
                      )}
                      initial={reducedMotion ? false : { width: "0%" }}
                      animate={{ width: `${clamped}%` }}
                      transition={
                        reducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }
                      }
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                    {clamped}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Keyword overlap summary */}
      {keywordStats && validProviders.length >= 2 && (
        <motion.section
          variants={itemVariants}
          className="flex flex-wrap items-center gap-3"
        >
          <Badge variant="secondary" className="text-xs">
            {t("keywordsFoundByAll", { count: keywordStats.inAllCount })}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {t("keywordsFoundByOne", { count: keywordStats.onlyOneCount })}
          </Badge>
        </motion.section>
      )}

      {/* Single provider note */}
      {validProviders.length === 1 && (
        <p className="text-sm text-muted-foreground">{t("addMoreProviders")}</p>
      )}

      {/* Columns (desktop) or Tabs (mobile) */}
      {isDesktop ? (
        <div className={cn("grid gap-4", colsClass)}>
          {validProviders.map((name) => {
            const result = data.results[name];
            if (result === undefined) {
              return (
                <motion.div key={name} variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {PROVIDER_LABELS[name] ?? name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">No result</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            }
            if (isErrorResult(result)) {
              return (
                <motion.div key={name} variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {PROVIDER_LABELS[name] ?? name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-destructive">{result.error}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            }
            const score = score_delta[name] ?? result.match_score ?? 0;
            const totalKw =
              result.keyword_matches.length + result.keyword_misses.length;
            const matchedKw = result.keyword_matches.length;
            const topGaps = result.gap_analysis
              .sort((a, b) => {
                const order = { critical: 0, preferred: 1, nice_to_have: 2 };
                return order[a.importance] - order[b.importance];
              })
              .slice(0, 3);

            return (
              <motion.div key={name} variants={itemVariants}>
                <ProviderColumn
                  providerName={name}
                  result={result}
                  score={score}
                  matchedKw={matchedKw}
                  totalKw={totalKw}
                  topGaps={topGaps}
                  t={t}
                  tResults={tResults}
                />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {validProviders.map((name) => (
              <Button
                key={name}
                variant={activeTab === name ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(name)}
              >
                {PROVIDER_LABELS[name] ?? name}
              </Button>
            ))}
          </div>
          {validProviders.map((name) => {
            if (activeTab !== name) return null;
            const result = data.results[name];
            if (result === undefined) {
              return (
                <Card key={name}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {PROVIDER_LABELS[name] ?? name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">No result</p>
                  </CardContent>
                </Card>
              );
            }
            if (isErrorResult(result)) {
              return (
                <Card key={name}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {PROVIDER_LABELS[name] ?? name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-destructive">{result.error}</p>
                  </CardContent>
                </Card>
              );
            }
            const score = score_delta[name] ?? result.match_score ?? 0;
            const totalKw =
              result.keyword_matches.length + result.keyword_misses.length;
            const matchedKw = result.keyword_matches.length;
            const topGaps = result.gap_analysis
              .sort((a, b) => {
                const order = { critical: 0, preferred: 1, nice_to_have: 2 };
                return order[a.importance] - order[b.importance];
              })
              .slice(0, 3);

            return (
              <ProviderColumn
                key={name}
                providerName={name}
                result={result}
                score={score}
                matchedKw={matchedKw}
                totalKw={totalKw}
                topGaps={topGaps}
                t={t}
                tResults={tResults}
              />
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

function ProviderColumn({
  providerName,
  score,
  matchedKw,
  totalKw,
  topGaps,
  t,
  tResults,
}: {
  providerName: string;
  result?: OptimizationResult;
  score: number;
  matchedKw: number;
  totalKw: number;
  topGaps: OptimizationResult["gap_analysis"];
  t: (key: string, values?: Record<string, number>) => string;
  tResults: (key: string, values?: Record<string, number>) => string;
}) {
  const isProvider = (s: string): s is LLMProviderName =>
    ["anthropic", "openai", "gemini"].includes(s);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {isProvider(providerName) ? (
            <ProviderBadge provider={providerName} />
          ) : (
            <span className="rounded-full bg-slate-700/80 px-2.5 py-0.5 text-xs font-medium text-slate-200">
              {PROVIDER_LABELS[providerName] ?? providerName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <ScoreGauge score={score} size={72} label="" />
        </div>
        <div>
          <span className="text-sm text-muted-foreground">
            {t("ofMatched", { matched: matchedKw, total: totalKw })}
          </span>
        </div>
        {topGaps.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t("topGaps")}</p>
            <ul className="space-y-1">
              {topGaps.map((gap) => (
                <li
                  key={`${gap.skill}-${gap.importance}`}
                  className="flex items-center gap-2 text-sm"
                >
                  <Badge
                    variant="outline"
                    className={cn("text-xs", SEVERITY_BADGE_CLASSES[gap.importance])}
                  >
                    {tResults(SEVERITY_KEYS[gap.importance])}
                  </Badge>
                  <span className="line-clamp-1 text-muted-foreground">{gap.skill}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link
          href="/results"
          className="inline-flex text-sm text-primary underline hover:text-primary/80"
        >
          {t("viewFullResults")}
        </Link>
      </CardContent>
    </Card>
  );
}
