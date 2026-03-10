/** Full-page overlay progress indicator with animated step list for optimization flow. */
"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgressBarProps } from "./ProgressBar.types";

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  const tCommon = useTranslations("common");
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep] ?? ""}`}
    >
      <div className="mx-4 w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6">
        <h3 className="text-center text-lg font-semibold text-foreground">
          {tCommon("processing")}
        </h3>
        <ul className="space-y-3">
          {steps.map((label, i) => {
            const status: "pending" | "active" | "complete" =
              i < currentStep ? "complete" : i === currentStep ? "active" : "pending";
            return (
              <motion.li
                key={label}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3",
                  status === "complete" && "border-primary/30 bg-primary/5",
                  status === "active" && "border-primary bg-primary/10",
                  status === "pending" && "border-border bg-muted/30",
                )}
                initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    status === "complete" && "bg-primary text-primary-foreground",
                    status === "active" && "bg-primary text-primary-foreground",
                    status === "pending" && "bg-muted text-muted-foreground",
                  )}
                >
                  {status === "complete" ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : status === "active" ? (
                    <Loader2
                      className={cn("h-4 w-4", !reducedMotion && "animate-spin")}
                      aria-hidden
                    />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    "flex-1 text-sm font-medium",
                    status === "complete" && "text-foreground",
                    status === "active" && "text-foreground",
                    status === "pending" && "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </motion.li>
            );
          })}
        </ul>
        <p className="text-center text-sm text-muted-foreground">
          {steps[currentStep] ?? tCommon("processing")}
        </p>
      </div>
    </div>
  );
}
