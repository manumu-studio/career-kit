/** Props for rendering copyable keyword chips. */
export interface KeywordChipsProps {
  keywords: string[];
  label?: string;
  className?: string;
  /** Enable staggered entrance animation. Default: false (render immediately). */
  animated?: boolean;
  /** Delay in milliseconds before the first chip appears. Only used when animated=true. */
  animationDelay?: number;
}
