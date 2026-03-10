/** LandingHero component props. */
import type { ReactNode } from "react";

export interface LandingHeroProps {
  /** Primary CTA (sign-in form or link to app). */
  primaryCta: ReactNode;
  /** Headline text. */
  heroTitle: string;
  /** Subheadline text. */
  heroSubtitle: string;
  /** Secondary CTA label (scroll to features). */
  ctaSecondaryLabel: string;
  /** Social proof text. */
  socialProof: string;
}
