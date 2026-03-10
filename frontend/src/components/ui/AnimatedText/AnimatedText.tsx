/** Animated text reveal with Framer Motion word-by-word stagger. */
"use client";

import { LazyMotion, m, domAnimation, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AnimatedTextProps } from "./AnimatedText.types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (reduceMotion: boolean) => ({
    opacity: 1,
    transition: reduceMotion
      ? { duration: 0 }
      : {
          staggerChildren: 0.06,
          delayChildren: 0.1,
        },
  }),
};

const wordVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (reduceMotion: boolean) =>
    reduceMotion
      ? { opacity: 1, y: 0 }
      : {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3 },
        },
};

export function AnimatedText({
  text,
  className,
  as: Component = "span",
  delay = 0,
  reduceMotion: reduceMotionProp,
}: AnimatedTextProps) {
  const systemPrefersReducedMotion = useReducedMotion();
  const reduceMotion = reduceMotionProp ?? systemPrefersReducedMotion ?? false;

  const words = text.trim().split(/\s+/);

  return (
    <LazyMotion features={domAnimation} strict>
      <Component className={cn("block", className)}>
        <m.span
          className="inline-flex flex-wrap"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          custom={reduceMotion}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { delay, staggerChildren: 0.06, delayChildren: 0.1 }
          }
        >
          {words.map((word, i) => (
            <m.span
              key={`${word}-${i}`}
              variants={wordVariants}
              custom={reduceMotion}
              className="mr-[0.25em] inline-block"
            >
              {word}
            </m.span>
          ))}
        </m.span>
      </Component>
    </LazyMotion>
  );
}
