"use client";

/** History detail page showing full research and/or optimization results. */
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  LoadingSkeleton,
  ResultsSectionSkeleton,
} from "@/components/ui/LoadingSkeleton";
import { CvComparison } from "@/components/ui/CvComparison";
import { GapAnalysis } from "@/components/ui/GapAnalysis";
import { KeywordMatch } from "@/components/ui/KeywordMatch";
import { CompanyReport } from "@/components/ui/CompanyReport";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/features/auth";
import { fetchHistoryDetail, handleApiError } from "@/lib/api";
import type { CompanyResearchResult } from "@/types/company";
import type { OptimizationResult } from "@/types/optimization";
import type { HistoryDetailResponse } from "@/types/history";

function readUnknownProp(obj: object, key: string): unknown {
  if (!Object.prototype.hasOwnProperty.call(obj, key)) {
    return undefined;
  }
  return Reflect.get(obj, key);
}

function isCompanyResearchResult(value: unknown): value is CompanyResearchResult {
  if (typeof value !== "object" || value === null) return false;
  const profile = readUnknownProp(value, "profile");
  const report = readUnknownProp(value, "report");
  return (
    typeof profile === "object" &&
    profile !== null &&
    typeof report === "object" &&
    report !== null &&
    Array.isArray(readUnknownProp(value, "sources_used")) &&
    typeof readUnknownProp(value, "research_quality") === "string" &&
    typeof readUnknownProp(value, "researched_at") === "string"
  );
}

function isOptimizationResult(value: unknown): value is OptimizationResult {
  if (typeof value !== "object" || value === null) return false;
  return (
    Array.isArray(readUnknownProp(value, "sections")) &&
    Array.isArray(readUnknownProp(value, "gap_analysis")) &&
    Array.isArray(readUnknownProp(value, "keyword_matches")) &&
    Array.isArray(readUnknownProp(value, "keyword_misses")) &&
    typeof readUnknownProp(value, "match_score") === "number" &&
    typeof readUnknownProp(value, "summary") === "string"
  );
}

export default function HistoryDetailPage() {
  const t = useTranslations("history");
  const tResults = useTranslations("results");
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = typeof params.id === "string" ? params.id : null;

  const [detail, setDetail] = useState<HistoryDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistoryDetail(id, session?.user?.externalId);
      setDetail(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [id, session?.user?.externalId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  if (!id) {
    router.replace("/history");
    return null;
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <div className="space-y-2">
          <LoadingSkeleton variant="text" className="h-8 w-48" />
          <LoadingSkeleton variant="text" className="h-4 w-32" />
        </div>
        <ResultsSectionSkeleton />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold text-foreground">{t("analysisNotFound")}</h1>
        <p className="text-muted-foreground">{error ?? t("mayHaveBeenDeleted")}</p>
        <Link className="text-primary underline" href="/history">
          {t("backToHistory")}
        </Link>
      </div>
    );
  }

  const companyResearch = detail.company_research_json
    ? (isCompanyResearchResult(detail.company_research_json)
        ? detail.company_research_json
        : null)
    : null;

  const optimizationResult = detail.optimization_result_json
    ? (isOptimizationResult(detail.optimization_result_json)
        ? detail.optimization_result_json
        : null)
    : null;

  const hasContent = companyResearch !== null || optimizationResult !== null;

  if (!hasContent) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold text-foreground">{t("noResults")}</h1>
        <p className="text-muted-foreground">{t("noStoredData")}</p>
        <Link className="text-primary underline" href="/history">
          {t("backToHistory")}
        </Link>
      </div>
    );
  }

  const breadcrumbLabel =
    detail.company_name ?? detail.job_title ?? id.slice(0, 8);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/history"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              {t("backToHistory")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground" aria-current="page">
            {t("breadcrumbAnalysis")} — {breadcrumbLabel}
          </li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {detail.company_name ?? t("analysis")}{" "}
            {detail.job_title ? `— ${detail.job_title}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(detail.created_at).toLocaleString()}
            {detail.cache_hit ? (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {t("loadedFromCache")}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/home" className={buttonVariants({ variant: "outline", size: "sm" })}>
            {t("reRunAnalysis")}
          </Link>
          {optimizationResult ? (
            <Link
              href={`/history/compare?a=${id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {t("compareWithAnother")}
            </Link>
          ) : null}
        </div>
      </header>

      {companyResearch ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{t("companyResearch")}</h2>
          <CompanyReport research={companyResearch} headingLevel="h3" />
        </section>
      ) : null}

      {optimizationResult ? (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <ScoreCard score={optimizationResult.match_score} />
            </div>
            <div className="min-w-0 flex-1">
              <KeywordMatch
                matches={optimizationResult.keyword_matches}
                misses={optimizationResult.keyword_misses}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm leading-relaxed text-foreground">
              {optimizationResult.summary}
            </p>
          </div>

          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:inline-flex sm:w-auto sm:justify-start">
              <TabsTrigger value="comparison">{tResults("tabCvComparison")}</TabsTrigger>
              <TabsTrigger value="gaps">{tResults("tabGapAnalysis")}</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="mt-4">
              <CvComparison sections={optimizationResult.sections} />
            </TabsContent>

            <TabsContent value="gaps" className="mt-4">
              <GapAnalysis gaps={optimizationResult.gap_analysis} />
            </TabsContent>
          </Tabs>
        </section>
      ) : null}
    </div>
  );
}
