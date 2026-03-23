"use client";

/** Compare page showing side-by-side results from multiple LLM providers. */
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GitCompare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProviderComparison } from "@/components/ui/ProviderComparison";
import { useOptimizationContext } from "@/context/OptimizationContext";

export default function ComparePage() {
  const t = useTranslations("providerCompare");
  const { comparisonResult } = useOptimizationContext();

  if (!comparisonResult) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <GitCompare className="h-14 w-14 text-muted-foreground" aria-hidden />
        <h1 className="text-2xl font-semibold text-foreground">{t("runComparisonFirst")}</h1>
        <p className="text-muted-foreground">{t("runComparisonCta")}</p>
        <Link href="/home" className={buttonVariants()}>
          {t("backToUpload")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:py-12">
      <ProviderComparison data={comparisonResult} />
    </div>
  );
}
