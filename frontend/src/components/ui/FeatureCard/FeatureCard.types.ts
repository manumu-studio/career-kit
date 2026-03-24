/** FeatureCard component props. */
import type { LucideIcon } from "lucide-react";

export interface FeatureCardProps {
  /** Lucide icon component. */
  icon: LucideIcon;
  /** Card title. */
  title: string;
  /** Card description. */
  description: string;
  /** Visual slot (CSS-based mockup). */
  visual: React.ReactNode;
  /** Whether to reverse layout (visual on left). */
  reverse?: boolean;
  /** Visual variant. 'glass' uses glassmorphism styling for dark backgrounds. */
  variant?: "default" | "glass";
}
