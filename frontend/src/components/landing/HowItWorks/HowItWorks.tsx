/** How It Works section — 3-step flow with sequential scroll reveal. */
"use client";

import { Upload, FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { StepCard } from "@/components/ui/StepCard";

const STEPS = [
  { icon: Upload, titleKey: "step1Title" as const, descKey: "step1Desc" as const },
  {
    icon: FileText,
    titleKey: "step2Title" as const,
    descKey: "step2Desc" as const,
  },
  {
    icon: Sparkles,
    titleKey: "step3Title" as const,
    descKey: "step3Desc" as const,
  },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing");

  return (
    <section
      className="bg-background py-20 md:py-28"
      aria-labelledby="howitworks-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="howitworks-heading"
          className="mb-16 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
        >
          {t("howItWorksTitle")}
        </h2>

        <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Connecting line — visible on desktop */}
          <div
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 md:block"
            aria-hidden
          >
            <div className="mx-auto h-full w-px bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />
          </div>

          {STEPS.map((step, i) => (
            <StepCard
              key={step.titleKey}
              step={i + 1}
              icon={step.icon}
              title={t(step.titleKey)}
              description={t(step.descKey)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
