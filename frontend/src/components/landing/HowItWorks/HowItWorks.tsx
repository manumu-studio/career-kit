/** How It Works section — 3-step flow with SVG line draw animation. */
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
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
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <section
      ref={sectionRef}
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
          {/* SVG connecting line — visible on desktop */}
          <svg
            className="pointer-events-none absolute inset-0 hidden md:block"
            aria-hidden
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 167 50 L 500 50 L 833 50"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeOpacity="0.3"
              strokeDasharray="8 4"
              style={{ pathLength: reducedMotion ? 1 : pathLength }}
            />
          </svg>

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
