"use client";

/** Wraps app content with AnimatePresence for page transition animations. */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const TRANSITION_DURATION = 0.2;
const CROSS_TRANSITION_DURATION = 0.3;

function isLandingRoute(path: string): boolean {
  const segments = path.split("/").filter(Boolean);
  return segments.length <= 1;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const prevPathnameRef = useRef(pathname);
  const [transitionDuration, setTransitionDuration] = useState(TRANSITION_DURATION);

  useEffect(() => {
    const prevIsLanding = isLandingRoute(prevPathnameRef.current);
    const currentIsLanding = isLandingRoute(pathname);

    if (prevIsLanding !== currentIsLanding) {
      setTransitionDuration(CROSS_TRANSITION_DURATION);
    } else {
      setTransitionDuration(TRANSITION_DURATION);
    }

    prevPathnameRef.current = pathname;
  }, [pathname]);

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

  const transition = reducedMotion ? { duration: 0 } : { duration: transitionDuration };

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
