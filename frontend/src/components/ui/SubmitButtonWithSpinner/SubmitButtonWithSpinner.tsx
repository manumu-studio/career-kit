"use client";

/** Submit button that shows a spinner when form is submitting (uses useFormStatus). */
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonWithSpinnerProps
  extends React.ComponentProps<typeof Button> {
  spinnerClassName?: string;
}

export function SubmitButtonWithSpinner({
  children,
  className,
  spinnerClassName,
  disabled,
  ...props
}: SubmitButtonWithSpinnerProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={className}
      disabled={disabled || pending}
      aria-busy={pending}
      {...props}
    >
      {pending ? (
        <span
          className={cn(
            "h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent",
            spinnerClassName,
          )}
          aria-hidden
        />
      ) : (
        children
      )}
    </Button>
  );
}
