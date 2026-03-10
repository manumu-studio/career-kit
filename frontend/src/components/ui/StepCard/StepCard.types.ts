/** StepCard component props. */
import type { LucideIcon } from "lucide-react";

export interface StepCardProps {
  /** Step number (1, 2, 3). */
  step: number;
  /** Lucide icon component. */
  icon: LucideIcon;
  /** Step title. */
  title: string;
  /** Step description. */
  description: string;
}
