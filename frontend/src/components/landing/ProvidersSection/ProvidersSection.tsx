/** Multi-provider showcase section. */
"use client";

import Image from "next/image";
import { LazyMotion, m, domAnimation, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (reduceMotion: boolean) =>
    reduceMotion
      ? { opacity: 1, y: 0 }
      : {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4 },
        },
};

const PROVIDERS = [
  { key: "providerAnthropic" as const, logo: "/assets/providers/anthropic.svg" },
  { key: "providerOpenAI" as const, logo: "/assets/providers/openai.svg" },
  { key: "providerGemini" as const, logo: "/assets/providers/gemini.svg" },
] as const;

export function ProvidersSection() {
  const t = useTranslations("landing");
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="bg-card py-20 md:py-28"
      aria-labelledby="providers-heading"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <LazyMotion features={domAnimation} strict>
          <m.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={reduceMotion}
          >
            <h2
              id="providers-heading"
              className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
            >
              {t("providersTitle")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("providersDesc")}</p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              {PROVIDERS.map((p) => (
                <div
                  key={p.key}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-5 py-3"
                >
                  <span className="dark:invert" aria-hidden>
                    <Image
                      src={p.logo}
                      alt=""
                      width={28}
                      height={28}
                      className="size-7 object-contain"
                    />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {t(p.key)}
                  </span>
                </div>
              ))}
            </div>
          </m.div>
        </LazyMotion>
      </div>
    </section>
  );
}
