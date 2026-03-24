/** Hero animation state machine hook — orchestrates synchronized CV demo sequence. */

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { AnimationPhase } from "@/components/landing/CvDemoPreview/CvDemoPreview.types";

/** Hero animation timing constants (milliseconds). */
export const HERO_TIMING = {
  /** CV internal scan + highlight + rewrite cycle. */
  scanDuration: 500,
  highlightDuration: 400,
  rewriteDuration: 500,
  /** Delay before remaining chips appear (after initial trio finishes). */
  remainingChipsDelay: 1200,
} as const;

/**
 * CV internal phase sequence — runs independently inside the CV card.
 * Score + first chip animate in parallel from t=0.
 */
const CV_PHASE_SEQUENCE: Array<{ phase: AnimationPhase; duration: number }> = [
  { phase: "scanning", duration: HERO_TIMING.scanDuration },
  { phase: "highlighting", duration: HERO_TIMING.highlightDuration },
  { phase: "rewriting", duration: HERO_TIMING.rewriteDuration },
];

export interface UseHeroAnimationReturn {
  /** Current CV internal animation phase. */
  cvPhase: AnimationPhase;
  /** Whether score + first chip should be visible (true from t=0). */
  showScore: boolean;
  /** Whether remaining keyword chips should appear. */
  showRemainingChips: boolean;
  /** Whether the full animation has completed. */
  isComplete: boolean;
}

export function useHeroAnimation(): UseHeroAnimationReturn {
  const reducedMotion = useReducedMotion();
  const [cvPhase, setCvPhase] = useState<AnimationPhase>("idle");
  const [showRemainingChips, setShowRemainingChips] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setCvPhase("complete");
      setShowRemainingChips(true);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    /* CV internal phase sequence starts immediately */
    let elapsed = 0;
    for (const step of CV_PHASE_SEQUENCE) {
      const delay = elapsed;
      timeouts.push(setTimeout(() => setCvPhase(step.phase), delay));
      elapsed += step.duration;
    }
    timeouts.push(setTimeout(() => setCvPhase("complete"), elapsed));

    /* Remaining chips appear after the initial trio finishes */
    timeouts.push(
      setTimeout(() => setShowRemainingChips(true), HERO_TIMING.remainingChipsDelay),
    );

    return () => timeouts.forEach(clearTimeout);
  }, [reducedMotion]);

  return {
    cvPhase,
    showScore: true, // visible from t=0, Framer handles entrance animation
    showRemainingChips,
    isComplete: cvPhase === "complete" && showRemainingChips,
  };
}

/** Keywords that get highlighted in the CV demo. */
export const HERO_KEYWORDS = [
  "React",
  "Node.js",
  "TypeScript",
  "Next.js",
  "OAuth 2.0",
  "OIDC",
  "AWS",
  "PostgreSQL",
  "REST APIs",
  "Python",
];

/** The bullet that gets rewritten during the animation. */
export const HERO_REWRITE = {
  original:
    "Implemented real-time company intelligence pipeline with web scraping and NLP analysis",
  optimized:
    "Architected real-time company intelligence pipeline leveraging web scraping, NLP, and LLM synthesis to generate actionable hiring insights",
};

/** Hero score value. */
export const HERO_SCORE = 78;

/** Matched/total keyword counts for the chip counter. */
export const HERO_KEYWORD_COUNTS = { matched: 12, total: 16 };
