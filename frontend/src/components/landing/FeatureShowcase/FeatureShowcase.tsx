/** Feature showcase section — 3 service cards with alternating layout. */
"use client";

import { LazyMotion, m, domAnimation, useReducedMotion } from "framer-motion";
import { FileText, Mail, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { ScoreGauge } from "@/components/ui/ScoreGauge";

function CvVisual() {
  const t = useTranslations("results");
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center">
      <ScoreGauge score={92} size={140} label={t("scoreLabel")} />
    </div>
  );
}

function CoverLetterVisual() {
  return (
    <div className="flex h-full min-h-[180px] flex-col gap-3">
      <div className="flex gap-2">
        {["Professional", "Conversational", "Enthusiastic"].map((tone, i) => (
          <span
            key={i}
            className={`rounded px-2 py-1 text-xs ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {tone}
          </span>
        ))}
      </div>
      <div className="flex-1 space-y-2 rounded border border-border bg-background p-3">
        <div className="h-2 w-3/4 rounded bg-muted" />
        <div className="h-2 w-full rounded bg-muted" />
        <div className="h-2 w-5/6 rounded bg-muted" />
      </div>
    </div>
  );
}

function CompanyVisual() {
  return (
    <div className="flex h-full min-h-[180px] flex-col gap-3">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Culture</span>
        <span className="font-medium text-foreground">●●●○○</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Growth</span>
        <span className="font-medium text-foreground">●●●●○</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Interview</span>
        <span className="font-medium text-foreground">●●●○○</span>
      </div>
    </div>
  );
}

export function FeatureShowcase() {
  const t = useTranslations("landing");
  const reduceMotion = useReducedMotion() ?? false;

  const features = [
    {
      icon: FileText,
      titleKey: "feature1Title" as const,
      descKey: "feature1Desc" as const,
      visual: <CvVisual />,
      reverse: false,
    },
    {
      icon: Mail,
      titleKey: "feature2Title" as const,
      descKey: "feature2Desc" as const,
      visual: <CoverLetterVisual />,
      reverse: true,
    },
    {
      icon: Building2,
      titleKey: "feature3Title" as const,
      descKey: "feature3Desc" as const,
      visual: <CompanyVisual />,
      reverse: false,
    },
  ];

  return (
    <section
      id="features"
      className="bg-card py-20 md:py-28"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <LazyMotion features={domAnimation} strict>
          <m.h2
            id="features-heading"
            className="mb-16 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
          >
            {t("featuresTitle")}
          </m.h2>
        </LazyMotion>

        <div className="flex flex-col gap-16 md:gap-24">
          {features.map((f, index) => (
            <LazyMotion key={f.titleKey} features={domAnimation} strict>
              <m.div
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: index % 2 === 0 ? -40 : 40 }
                }
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.3, delay: index * 0.1 }
                }
              >
                <FeatureCard
                  icon={f.icon}
                  title={t(f.titleKey)}
                  description={t(f.descKey)}
                  visual={f.visual}
                  reverse={f.reverse}
                  variant="glass"
                />
              </m.div>
            </LazyMotion>
          ))}
        </div>
      </div>
    </section>
  );
}
