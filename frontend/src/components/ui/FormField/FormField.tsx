/** Wrapper for form inputs with built-in validation display. */
import { cn } from "@/lib/utils";
import type { FormFieldProps } from "./FormField.types";

export function FormField({
  label,
  error,
  hint,
  required,
  showValidIndicator = false,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      <div
        className={cn(
          "flex items-center gap-2",
          error ? "[&>div]:border-destructive [&>div]:ring-destructive/30" : "",
        )}
      >
        {children}
        {error ? null : showValidIndicator ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-success"
            aria-hidden
          >
            ✓
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
