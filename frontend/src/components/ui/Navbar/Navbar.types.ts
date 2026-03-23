/** Navbar component type definitions. */

export type NavbarMode = "app" | "public";
export type NavbarVariant = "default" | "transparent";

export interface NavbarProps {
  /** Layout mode: app (authenticated, nav links) or public (landing, no nav links). */
  mode: NavbarMode;
  /** Visual variant. "transparent" starts with no bg and fades in glass on scroll. */
  variant?: NavbarVariant;
  /** User display name (app mode only). */
  userName?: string | null;
  /** User email (app mode only). */
  userEmail?: string | null;
  className?: string;
}
