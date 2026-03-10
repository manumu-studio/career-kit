/** Navbar component type definitions. */

export type NavbarMode = "app" | "public";

export interface NavbarProps {
  /** Layout mode: app (authenticated, nav links) or public (landing, no nav links). */
  mode: NavbarMode;
  /** User display name (app mode only). */
  userName?: string | null;
  /** User email (app mode only). */
  userEmail?: string | null;
  className?: string;
}
