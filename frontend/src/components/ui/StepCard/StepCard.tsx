/** Step card for How It Works flow — number, icon, title, description. */
"use client";

import { LazyMotion, m, domAnimation, useReducedMotion } from "framer-motion";
import type { StepCardProps } from "./StepCard.types";

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (reduceMotion: boolean) =>
    reduceMotion
      ? { opacity: 1, y: 0 }
      : {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35 },
        },
};

export function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: StepCardProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className="relative flex flex-col items-center text-center"
        variants={stepVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        custom={reduceMotion}
      >
        <div className="relative flex flex-col items-center">
          <m.span
            className="absolute -top-2 left-1/2 flex size-6 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
            aria-hidden
            initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.3, delay: 0.2 }}
          >
            {step}
          </m.span>
          <m.div
            className="flex size-14 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary"
            aria-hidden
            whileInView={
              reduceMotion
                ? {}
                : {
                    scale: [1, 1.1, 1],
                    transition: { duration: 0.6, ease: "easeInOut" },
                  }
            }
            viewport={{ once: true, margin: "-60px" }}
          >
            <Icon className="size-7" />
          </m.div>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          {description}
        </p>
      </m.div>
    </LazyMotion>
  );
}
