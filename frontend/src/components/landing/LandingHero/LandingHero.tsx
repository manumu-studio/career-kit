/** Hero section for landing page — split layout with CV demo animation. */
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CvDemoPreview } from "@/components/landing/CvDemoPreview";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useHeroAnimation,
  HERO_KEYWORDS,
  HERO_REWRITE,
  HERO_SCORE,
  HERO_KEYWORD_COUNTS,
} from "./useHeroAnimation";
import type { LandingHeroProps } from "./LandingHero.types";

function scrollToFeatures() {
  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
}

export function LandingHero({
  primaryCta,
  heroTitle,
  heroSubtitle,
  ctaSecondaryLabel,
  socialProof,
  welcomeBackText,
  secondaryCta,
}: LandingHeroProps) {
  const { cvPhase, showScore } = useHeroAnimation();
  const t = useTranslations("landing");
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section
      className="flex min-h-dvh flex-col items-center justify-center overflow-x-clip px-4 py-16 sm:px-6 md:py-24"
      aria-labelledby="hero-heading">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-12">
        {/* Left — Text content */}
        <div className="flex flex-col gap-6 text-center lg:text-left">
          {welcomeBackText ? (
            <p className="text-xl font-semibold text-foreground sm:text-2xl">
              {welcomeBackText}
            </p>
          ) : null}

          {/* Title with blur glow backdrop */}
          <div className="relative">
            <h1
              id="hero-heading"
              className={cn(
                "font-bold tracking-tight text-foreground",
                "text-[2rem] leading-tight sm:text-4xl md:text-5xl lg:text-6xl",
                "font-[family-name:var(--font-raleway)]",
              )}>
              <AnimatedText
                text={heroTitle}
                as="span"
                className="block"
                reduceMotion={reducedMotion}
              />
            </h1>
            {/* Blur glow behind title */}
            <div
              className="absolute -inset-x-4 -inset-y-2 -z-10 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-80 blur-xl"
              aria-hidden
            />
          </div>

          <motion.p
            className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl lg:mx-0"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reducedMotion ? { duration: 0 } : { delay: 0.4, duration: 0.3 }
            }>
            {heroSubtitle}
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 lg:justify-start"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reducedMotion ? { duration: 0 } : { delay: 0.6, duration: 0.3 }
            }>
            <div className="[&_button]:min-w-[180px] [&_a]:min-w-[180px]">
              {primaryCta}
            </div>
            {secondaryCta ?? (
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToFeatures}
                className="min-w-[180px] border-2"
                aria-label={ctaSecondaryLabel}>
                {ctaSecondaryLabel}
              </Button>
            )}
          </motion.div>

          <motion.p
            className="text-sm text-muted-foreground"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              reducedMotion ? { duration: 0 } : { delay: 0.7, duration: 0.3 }
            }>
            {socialProof}
          </motion.p>
        </div>

        {/* Right — CV Demo + Score + Keywords (all start simultaneously) */}
        <div className="flex flex-col items-center gap-4">
          {/* CV card wrapper — score overlays this */}
          <div className="relative">
            {/* CV card — fades/scales in from t=0 */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.5, ease: "easeOut" }
              }>
              <CvDemoPreview
                highlightedKeywords={HERO_KEYWORDS}
                animationPhase={cvPhase}
                rewrittenBullet={HERO_REWRITE}
              />
            </motion.div>

            {/* Score gauge — fades/scales in from t=0, parallel with CV */}
            {showScore && (
              <motion.div
                className="absolute -top-4 right-0 z-10 sm:-right-6 sm:-top-6"
                initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.6, ease: "easeOut" }
                }>
                <div className="rounded-xl border border-border bg-[var(--landing-surface)] p-3 shadow-lg [--foreground:var(--landing-text)] [--muted-foreground:var(--landing-text-muted)]">
                  <ScoreGauge
                    score={HERO_SCORE}
                    size={100}
                    label={t("scoreLabel")}
                    animateFrom={0}
                  />
                  <p className="mt-1 text-center text-xs font-medium text-[var(--landing-text)]">
                    {t("strongMatch")}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Missing keyword chips — aligned with CV left edge */}
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {["GraphQL", "Terraform", "Kubernetes", "gRPC"].map((kw, i) => (
                  <motion.span
                    key={kw}
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{ color: "rgb(229, 77, 77)", backgroundColor: "rgba(223, 140, 169, 0.25)" }}
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { delay: 0.2 + i * 0.08, duration: 0.3 }
                    }>
                    {kw}
                  </motion.span>
                ))}
              </div>
              <motion.p
                className="mt-2 text-xs text-[var(--landing-text-muted)]"
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { delay: 0.5, duration: 0.3 }
                }>
                {t("keywordsMissing", {
                  missing: HERO_KEYWORD_COUNTS.total - HERO_KEYWORD_COUNTS.matched,
                  total: HERO_KEYWORD_COUNTS.total,
                })}
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
