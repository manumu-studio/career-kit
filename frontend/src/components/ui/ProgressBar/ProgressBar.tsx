/** Multi-step progress indicator for optimization flow. */
"use client";

import { cn } from "@/lib/utils";
import type { ProgressBarProps } from "./ProgressBar.types";

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep] ?? ""}`}
      className="w-full space-y-3"
    >
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 transition-colors duration-300",
              i <= currentStep
                ? "border-sky-400/50 bg-sky-500/10"
                : "border-slate-700 bg-slate-800/40",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                i <= currentStep ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-slate-400",
              )}
            >
              {i < currentStep ? "✓" : i + 1}
            </span>
            <span
              className={cn(
                "truncate text-sm font-medium transition-colors duration-300",
                i <= currentStep ? "text-slate-100" : "text-slate-500",
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-slate-400">
        {steps[currentStep] ?? "Processing..."}
      </p>
    </div>
  );
}
