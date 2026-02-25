/** Derives score card labels, colors, and SVG progress values. */
interface ScoreCardState {
  score: number;
  label: string;
  accentClass: string;
  trailClass: string;
  offset: number;
}

const FULL_CIRCLE = 2 * Math.PI * 52;

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function useScoreCard(rawScore: number): ScoreCardState {
  const score = clampScore(rawScore);

  if (score < 40) {
    return {
      score,
      label: "Low Match",
      accentClass: "text-rose-400",
      trailClass: "text-rose-500/20",
      offset: FULL_CIRCLE * (1 - score / 100),
    };
  }

  if (score < 70) {
    return {
      score,
      label: "Moderate Match",
      accentClass: "text-amber-400",
      trailClass: "text-amber-500/20",
      offset: FULL_CIRCLE * (1 - score / 100),
    };
  }

  return {
    score,
    label: "Strong Match",
    accentClass: "text-emerald-400",
    trailClass: "text-emerald-500/20",
    offset: FULL_CIRCLE * (1 - score / 100),
  };
}
