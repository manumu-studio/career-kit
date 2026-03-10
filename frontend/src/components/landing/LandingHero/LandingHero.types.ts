/** LandingHero component props. */
import type { ReactNode } from "react";

export interface LandingHeroProps {
  /** Primary CTA (sign-in form or link to app). */
  primaryCta: ReactNode;
  /** Headline text. */
  heroTitle: string;
  /** Subheadline text. */
  heroSubtitle: string;
  /** Secondary CTA label (scroll to features) — used when secondaryCta not provided. */
  ctaSecondaryLabel: string;
  /** Social proof text. */
  socialProof: string;
  /** Optional welcome text above headline (e.g. "Hi John, welcome back!"). */
  welcomeBackText?: string;
  /** Optional secondary CTA (e.g. Sign out button when logged in). When provided, replaces default scroll button. */
  secondaryCta?: ReactNode;
}
