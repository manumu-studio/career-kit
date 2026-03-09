/** Types for FormField wrapper component. */
import type { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  error?: string | null;
  hint?: string | null;
  required?: boolean;
  showValidIndicator?: boolean;
  children: ReactNode;
}
