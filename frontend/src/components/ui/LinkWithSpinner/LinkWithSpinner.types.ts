/** Props for LinkWithSpinner — locale-aware or default Next.js Link with loading state. */
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export interface LinkWithSpinnerProps
  extends Omit<ComponentProps<typeof Link>, "children"> {
  children: ReactNode;
  spinnerClassName?: string;
  /** Use locale-aware Link for internal routes (e.g. /home). Use false for API routes. */
  useLocale?: boolean;
}
