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
      accentClass: "text-destructive",
      trailClass: "text-destructive/20",
      offset: FULL_CIRCLE * (1 - score / 100),
    };
  }

  if (score < 70) {
    return {
      score,
      label: "Moderate Match",
      accentClass: "text-warning",
      trailClass: "text-warning/20",
      offset: FULL_CIRCLE * (1 - score / 100),
    };
  }

  return {
    score,
    label: "Strong Match",
    accentClass: "text-success",
    trailClass: "text-success/20",
    offset: FULL_CIRCLE * (1 - score / 100),
  };
}
