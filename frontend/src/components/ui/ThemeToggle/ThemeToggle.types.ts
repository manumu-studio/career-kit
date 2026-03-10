/** ThemeToggle component type definitions. */

export interface ThemeToggleProps {
  className?: string;
  /** Accessible label for light mode (used when current theme is dark). */
  lightLabel?: string;
  /** Accessible label for dark mode (used when current theme is light). */
  darkLabel?: string;
}
