/** Props for SubmitButtonWithSpinner — extends the shared Button with pending UI. */
import type { ComponentProps } from "react";

type ButtonComponent = (typeof import("@/components/ui/button"))["Button"];

export interface SubmitButtonWithSpinnerProps extends ComponentProps<ButtonComponent> {
  spinnerClassName?: string;
}
