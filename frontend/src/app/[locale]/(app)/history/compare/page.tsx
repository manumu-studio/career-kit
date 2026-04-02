"use client";

/** Compare two optimization results side-by-side. */
import { Suspense, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ComparisonView } from "@/components/ui/ComparisonView";
import { useSession } from "@/features/auth";
import { fetchHistoryDetail, handleApiError } from "@/lib/api";
import type { OptimizationResult } from "@/types/optimization";

function CompareLoadingFallback() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}

function readUnknownProp(obj: object, key: string): unknown {
  if (!Object.prototype.hasOwnProperty.call(obj, key)) {
    return undefined;
  }
  return Reflect.get(obj, key);
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

function ComparePageContent() {
  const t = useTranslations("compare");
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");

  const [resultA, setResultA] = useState<OptimizationResult | null>(null);
  const [resultB, setResultB] = useState<OptimizationResult | null>(null);
  const [labelA, setLabelA] = useState<string>(() => t("versionA"));
  const [labelB, setLabelB] = useState<string>(() => t("versionB"));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBoth = useCallback(async () => {
    if (!idA || !idB) {
      setError(t("provideIds"));
      setIsLoading(false);
      return;
    }
    if (idA === idB) {
      setError(t("selectDifferent"));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [detailA, detailB] = await Promise.all([
        fetchHistoryDetail(idA, session?.user?.externalId),
        fetchHistoryDetail(idB, session?.user?.externalId),
      ]);

      const optA = detailA.optimization_result_json;
      const optB = detailB.optimization_result_json;

      if (!optA || !isOptimizationResult(optA)) {
        setError(t("noDataA"));
        return;
      }
      if (!optB || !isOptimizationResult(optB)) {
        setError(t("noDataB"));
        return;
      }

      setResultA(optA);
      setResultB(optB);
      setLabelA(
        detailA.company_name && detailA.job_title
          ? `${detailA.company_name} — ${detailA.job_title}`
          : detailA.company_name ?? t("versionA"),
      );
      setLabelB(
        detailB.company_name && detailB.job_title
          ? `${detailB.company_name} — ${detailB.job_title}`
          : detailB.company_name ?? t("versionB"),
      );
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [idA, idB, session?.user?.externalId, t]);

  useEffect(() => {
    void loadBoth();
  }, [loadBoth]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (error || !resultA || !resultB) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground">{error ?? t("couldNotLoad")}</p>
        <Link className="text-primary underline" href="/history">
          {t("backToHistory")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
          href="/history"
        >
          {t("backToHistory")}
        </Link>
      </header>

      <ComparisonView
        labelA={labelA}
        labelB={labelB}
        resultA={resultA}
        resultB={resultB}
      />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareLoadingFallback />}>
      <ComparePageContent />
    </Suspense>
  );
}
