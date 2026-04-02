/** Types for FlowFieldBackground component. */

export interface FlowFieldBackgroundProps {
  className?: string;
  /**
   * Color of the particles.
   * Defaults to indigo if not specified.
   */
  color?: string;
  /**
   * The opacity of the trails (0.0 to 1.0).
   * Lower = longer trails. Higher = shorter trails.
   * Default: 0.15
   */
  trailOpacity?: number;
  /**
   * Number of particles. Default: 600
   */
  particleCount?: number;
  /**
   * Speed multiplier. Default: 1
   */
  speed?: number;
  /**
   * Background color for the fade effect.
   * If not provided, will use the container's computed background color.
   */
  backgroundColor?: string;
  /**
   * When true, renders a single static frame instead of continuous animation.
   */
  reducedMotion?: boolean;
}
