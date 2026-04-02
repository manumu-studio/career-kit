/** Final CTA conversion section before footer. */
"use client";

import { useTranslations } from "next-intl";
import type { CtaFooterSectionProps } from "./CtaFooterSection.types";

export function CtaFooterSection({ primaryCta }: CtaFooterSectionProps) {
  const t = useTranslations("landing");

  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      aria-labelledby="cta-footer-heading"
      style={{
        background:
          "linear-gradient(135deg, var(--landing-cta-gradient-start), var(--landing-cta-gradient-mid), var(--landing-cta-gradient-end))",
      }}>
      {/* Subtle noise overlay for texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2
          id="cta-footer-heading"
          className="text-2xl font-bold tracking-tight text-foreground dark:text-white sm:text-3xl md:text-4xl">
          {t("ctaFooterTitle")}
        </h2>

        <div className="mt-10">
          <div className="[&_button]:min-w-[200px] [&_button]:text-base [&_button]:shadow-lg [&_button]:shadow-white/10 [&_button]:transition-shadow [&_button]:hover:shadow-white/20 [&_a]:min-w-[200px] [&_a]:text-base [&_a]:shadow-lg [&_a]:shadow-white/10 [&_a]:transition-shadow [&_a]:hover:shadow-white/20">
            {primaryCta}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground dark:text-white/70">
          {t("ctaFooterTrust")}
        </p>
      </div>
    </section>
  );
}
