/** Types for the CvDemoPreview landing hero component. */

export type AnimationPhase =
  | "idle"
  | "scanning"
  | "highlighting"
  | "scoring"
  | "chipping"
  | "rewriting"
  | "complete";

export interface RewrittenBullet {
  /** Original bullet text that will be replaced. */
  original: string;
  /** Optimized bullet text that types in. */
  optimized: string;
}

export interface CvDemoPreviewProps {
  /** Keywords to highlight during the highlighting phase. */
  highlightedKeywords: string[];
  /** Current animation phase — controls visual state. */
  animationPhase: AnimationPhase;
  /** Bullet rewrite config for the rewriting phase. */
  rewrittenBullet: RewrittenBullet;
  /** Additional CSS classes. */
  className?: string;
}
