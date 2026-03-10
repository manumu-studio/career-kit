"use client";

/** Wraps app content with AnimatePresence for page transition animations. */
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const TRANSITION_DURATION = 0.2;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  const variants = {
    enter: reducedMotion
      ? {}
      : { opacity: 0, y: 8 },
    center: reducedMotion
      ? {}
      : { opacity: 1, y: 0 },
    exit: reducedMotion
      ? {}
      : { opacity: 0, y: -8 },
  };

  const transition = reducedMotion ? { duration: 0 } : { duration: TRANSITION_DURATION };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
