/** Hero section for landing page — animated headline, CTAs, AI gradient accent. */
"use client";

import { LazyMotion, m, domAnimation, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-16 sm:px-6 md:py-24"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto w-full max-w-3xl text-center">
        {welcomeBackText ? (
          <p className="mb-4 text-xl font-semibold text-foreground sm:text-2xl">
            {welcomeBackText}
          </p>
        ) : null}
        <div className="relative">
          <h1
            id="hero-heading"
            className={cn(
              "font-bold tracking-tight text-foreground",
              "text-[2rem] leading-tight sm:text-4xl md:text-5xl lg:text-6xl",
              "font-[family-name:var(--font-raleway)]"
            )}
          >
            <AnimatedText
              text={heroTitle}
              as="span"
              className="block"
              reduceMotion={reduceMotion}
            />
          </h1>
          <div
            className="absolute -inset-x-4 -inset-y-2 -z-10 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-80 blur-xl"
            aria-hidden
          />
        </div>

        <LazyMotion features={domAnimation} strict>
          <m.p
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { delay: 0.5, duration: 0.4 }
            }
          >
            {heroSubtitle}
          </m.p>
        </LazyMotion>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <div className="[&_button]:min-w-[180px] [&_a]:min-w-[180px]">
            {primaryCta}
          </div>
          {secondaryCta ?? (
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToFeatures}
              className="min-w-[180px] border-2"
              aria-label={ctaSecondaryLabel}
            >
              {ctaSecondaryLabel}
              <ChevronDown className="ml-2 size-4" aria-hidden />
            </Button>
          )}
        </div>

        <LazyMotion features={domAnimation} strict>
          <m.p
            className="mt-8 text-sm text-muted-foreground"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              reduceMotion ? { duration: 0 } : { delay: 0.8, duration: 0.3 }
            }
          >
            {socialProof}
          </m.p>
        </LazyMotion>
      </div>
    </section>
  );
}
