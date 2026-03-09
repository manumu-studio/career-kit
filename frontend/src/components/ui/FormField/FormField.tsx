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
      <label className="block text-sm font-medium text-slate-200">
        {label}
        {required ? <span className="text-rose-400"> *</span> : null}
      </label>
      <div
        className={cn(
          "flex items-center gap-2",
          error ? "[&>div]:border-rose-500 [&>div]:ring-rose-500/30" : "",
        )}
      >
        {children}
        {error ? null : showValidIndicator ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
            aria-hidden
          >
            ✓
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
