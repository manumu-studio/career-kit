"use client";

/** Company report page rendering research details from shared context. */
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FileSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CompanyReport } from "@/components/ui/CompanyReport";
import { useOptimizationContext } from "@/context/OptimizationContext";

export default function ReportPage() {
  const t = useTranslations("report");
  const { companyResearch } = useOptimizationContext();

  if (!companyResearch) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <FileSearch className="h-14 w-14 text-muted-foreground" aria-hidden />
        <h1 className="text-2xl font-semibold text-foreground">{t("noResearch")}</h1>
        <p className="text-muted-foreground">{t("researchFirst")}</p>
        <Link href="/home" className={buttonVariants()}>
          {t("backToHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link className="hover:text-foreground" href="/home">
          {t("backToUpload")}
        </Link>
      </div>
      <CompanyReport research={companyResearch} />
    </div>
  );
}
