"use client";

/** Company report page rendering research details from shared context. */
import Link from "next/link";
import { CompanyReport } from "@/components/ui/CompanyReport";
import { useOptimizationContext } from "@/context/OptimizationContext";

export default function ReportPage() {
  const { companyResearch } = useOptimizationContext();

  if (!companyResearch) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold text-white">No company research found</h1>
        <p className="text-slate-300">
          Research a company from the upload page to view the full report.
        </p>
        <Link className="text-sky-300 underline" href="/home">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <Link className="text-sm text-sky-300 underline" href="/home">
        ← Back to Upload
      </Link>
      <CompanyReport research={companyResearch} />
    </main>
  );
}
