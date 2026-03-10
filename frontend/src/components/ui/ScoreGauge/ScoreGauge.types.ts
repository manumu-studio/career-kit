/** ScoreGauge component props. */
export interface ScoreGaugeProps {
  /** Job match score 0–100. */
  score: number;
  /** Optional size in pixels. */
  size?: number;
  /** Optional label below score (e.g. "Job Match"). */
  label?: string;
}
