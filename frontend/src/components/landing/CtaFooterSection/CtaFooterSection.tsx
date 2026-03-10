/** Final CTA conversion section before footer. */
"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export interface CtaFooterSectionProps {
  /** Primary CTA (sign-in button or link to app). */
  primaryCta: ReactNode;
}

export function CtaFooterSection({ primaryCta }: CtaFooterSectionProps) {
  const t = useTranslations("landing");

  return (
    <section
      className="bg-background py-20 md:py-28"
      aria-labelledby="cta-footer-heading"
    >
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2
          id="cta-footer-heading"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
        >
          {t("ctaFooterTitle")}
        </h2>

        <div className="mt-10">
          <div className="[&_button]:min-w-[200px] [&_button]:text-base [&_a]:min-w-[200px] [&_a]:text-base">
            {primaryCta}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {t("ctaFooterTrust")}
        </p>
      </div>
    </section>
  );
}
