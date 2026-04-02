"use client";

/** Side-by-side comparison of optimization results from multiple LLM providers. */
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { OptimizationResult } from "@/types/optimization";
import type { LLMProviderName } from "@/types/provider";
import type { ProviderComparisonProps } from "./ProviderComparison.types";

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Claude",
  openai: "GPT-4o",
  gemini: "Gemini",
};

const STAGGER_DELAY = 0.1;

function isErrorResult(
  r: OptimizationResult | { error: string } | undefined,
): r is { error: string } {
  if (r === undefined || r === null) {
    return false;
  }
  if (typeof r !== "object") {
    return false;
  }
  if (!("error" in r)) {
    return false;
  }
  return typeof r.error === "string";
}

function optimizationFromComparisonEntry(
  entry: OptimizationResult | { error: string } | undefined,
): OptimizationResult | undefined {
  if (entry === undefined || isErrorResult(entry)) {
    return undefined;
  }
  return entry;
}

function getScoreBarColor(score: number): string {
  if (score <= 40) return "bg-destructive";
  if (score <= 70) return "bg-warning";
  return "bg-success";
}

export function ProviderComparison({ data }: ProviderComparisonProps) {
  const t = useTranslations("providerCompare");
  const reducedMotion = useReducedMotion();

  const validProviders = Object.keys(data.results);
  const successProviders = validProviders.filter((name) => {
    const r = data.results[name];
    return r !== undefined && !isErrorResult(r);
  });

  const { score_delta, unique_keywords } = data.comparison;

  const keywordStats = (() => {
    if (successProviders.length < 2) return null;
    const allMatches = successProviders.map((n) => {
      const opt = optimizationFromComparisonEntry(data.results[n]);
      return opt?.keyword_matches ?? [];
    });
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

  if (validProviders.length === 0) {
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

      <motion.section variants={itemVariants} className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">{t("scoreChart")}</h2>
        <div className="space-y-3">
          {validProviders.map((name) => {
            const res = data.results[name];
            const score =
              !res || isErrorResult(res)
                ? 0
                : score_delta[name] ?? res.match_score ?? 0;
            const clamped = Math.min(100, Math.max(0, Math.round(score)));
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm font-medium text-foreground">
                  {PROVIDER_LABELS[name] ?? name}
                </span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex h-6 flex-1 overflow-hidden rounded-md bg-muted/50">
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

      {keywordStats && validProviders.length >= 2 ? (
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
      ) : null}

      {validProviders.length === 1 ? (
        <p className="text-sm text-muted-foreground">{t("addMoreProviders")}</p>
      ) : null}

      <motion.div
        variants={itemVariants}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible md:snap-none lg:grid-cols-3"
      >
        {validProviders.map((name) => {
          const result = data.results[name];
          if (result === undefined) {
            return (
              <div
                key={name}
                className="min-w-[85vw] shrink-0 snap-center md:min-w-0 md:shrink"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {PROVIDER_LABELS[name] ?? name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">No result</p>
                  </CardContent>
                </Card>
              </div>
            );
          }
          if (isErrorResult(result)) {
            return (
              <div
                key={name}
                className="min-w-[85vw] shrink-0 snap-center md:min-w-0 md:shrink"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {PROVIDER_LABELS[name] ?? name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-destructive">{result.error}</p>
                  </CardContent>
                </Card>
              </div>
            );
          }
          const score = score_delta[name] ?? result.match_score ?? 0;
          const totalKw = result.keyword_matches.length + result.keyword_misses.length;
          const matchedKw = result.keyword_matches.length;

          return (
            <div
              key={name}
              className="min-w-[85vw] shrink-0 snap-center md:min-w-0 md:shrink"
            >
              <ProviderResultCard
                providerName={name}
                result={result}
                score={score}
                matchedKw={matchedKw}
                totalKw={totalKw}
                t={t}
              />
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

function ProviderResultCard({
  providerName,
  result,
  score,
  matchedKw,
  totalKw,
  t,
}: {
  providerName: string;
  result: OptimizationResult;
  score: number;
  matchedKw: number;
  totalKw: number;
  t: (key: string, values?: Record<string, number>) => string;
}) {
  const isProvider = (s: string): s is LLMProviderName =>
    ["anthropic", "openai", "gemini"].includes(s);

  const optimizedCvText = result.sections
    .map((s) => `${s.heading}\n${s.optimized}`)
    .join("\n\n");

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {isProvider(providerName) ? (
            <ProviderBadge provider={providerName} />
          ) : (
            <span className="rounded-full bg-muted/80 px-2.5 py-0.5 text-xs font-medium text-foreground">
              {PROVIDER_LABELS[providerName] ?? providerName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <ScoreGauge score={score} size={80} label="" />
        </div>
        <p className="text-sm text-muted-foreground">
          {t("ofMatched", { matched: matchedKw, total: totalKw })}
        </p>
        <ScrollArea className="max-h-[40vh]">
          <div className="whitespace-pre-wrap pr-3 text-sm text-foreground">
            {optimizedCvText}
          </div>
        </ScrollArea>
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
