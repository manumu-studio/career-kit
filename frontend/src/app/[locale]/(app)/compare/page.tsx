"use client";

/** Compare page showing side-by-side results from multiple LLM providers. */
import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { ProviderComparison } from "@/components/ui/ProviderComparison";
import { useOptimizationContext } from "@/context/OptimizationContext";

export default function ComparePage() {
  const router = useRouter();
  const { comparisonResult } = useOptimizationContext();

  useEffect(() => {
    if (!comparisonResult) {
      router.replace("/home");
    }
  }, [comparisonResult, router]);

  if (!comparisonResult) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:py-12">
      <ProviderComparison data={comparisonResult} />
    </main>
  );
}
