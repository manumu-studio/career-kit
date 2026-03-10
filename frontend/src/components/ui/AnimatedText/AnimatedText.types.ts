/** AnimatedText component props. */
export interface AnimatedTextProps {
  /** Text to animate (split by words for stagger). */
  text: string;
  /** Optional className for the wrapper. */
  className?: string;
  /** HTML element to render as (h1, h2, p, etc.). */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Delay before animation starts (seconds). */
  delay?: number;
  /** Whether to respect prefers-reduced-motion. */
  reduceMotion?: boolean;
}
