/** Feature card with icon, title, description, and decorative visual. */
"use client";

import { LazyMotion, m, domAnimation, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FeatureCardProps } from "./FeatureCard.types";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (reduceMotion: boolean) =>
    reduceMotion
      ? { opacity: 1, y: 0 }
      : {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4 },
        },
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  visual,
  reverse = false,
}: FeatureCardProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <LazyMotion features={domAnimation} strict>
      <m.article
        className={cn(
          "grid gap-8 md:grid-cols-2 md:items-center md:gap-12",
          reverse && "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1"
        )}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        custom={reduceMotion}
      >
        <div className="flex flex-col gap-4">
          <div
            className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden
          >
            <Icon className="size-6" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="min-h-[200px] rounded-xl border border-border bg-muted/30 p-6">
          {visual}
        </div>
      </m.article>
    </LazyMotion>
  );
}
