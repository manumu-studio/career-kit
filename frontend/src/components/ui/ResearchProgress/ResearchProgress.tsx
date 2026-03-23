"use client";

/** Vertical step indicator for company research states. */
import { cn } from "@/lib/utils";
import type { ResearchStep } from "@/types/company";
import type { ResearchProgressProps } from "./ResearchProgress.types";

interface StepDefinition {
  id: Exclude<ResearchStep, "idle" | "error">;
  label: string;
}

const STEPS: StepDefinition[] = [
  { id: "scraping", label: "Scraping website..." },
  { id: "searching", label: "Searching public sources..." },
  { id: "analyzing", label: "Analyzing with AI..." },
  { id: "done", label: "Research complete" },
];

function getStepStatus(
  currentStep: ResearchStep,
  step: StepDefinition["id"],
): "pending" | "active" | "done" | "error" {
  if (currentStep === "error") {
    return step === "analyzing" ? "error" : "done";
  }

  const currentIndex = STEPS.findIndex((candidate) => candidate.id === currentStep);
  const stepIndex = STEPS.findIndex((candidate) => candidate.id === step);
  if (currentIndex === -1) {
    return "pending";
  }
  if (stepIndex < currentIndex) {
    return "done";
  }
  if (stepIndex === currentIndex) {
    return step === "done" ? "done" : "active";
  }
  return "pending";
}

export function ResearchProgress({ currentStep, className }: ResearchProgressProps) {
  return (
    <section className={cn("space-y-3 rounded-lg border border-border p-4", className)}>
      <h3 className="text-sm font-semibold text-foreground">Research Progress</h3>
      <ol className="space-y-3">
        {STEPS.map((step) => {
          const status = getStepStatus(currentStep, step.id);
          return (
            <li key={step.id} className="flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                  status === "done" && "bg-success/20 text-success",
                  status === "active" && "bg-primary/20 text-primary",
                  status === "pending" && "bg-muted text-muted-foreground",
                  status === "error" && "bg-destructive/20 text-destructive",
                )}
              >
                {status === "done" ? "✓" : status === "error" ? "✕" : status === "active" ? "…" : "•"}
              </span>
              <span
                className={cn(
                  "text-sm",
                  status === "active" && "text-foreground",
                  status === "done" && "text-muted-foreground",
                  status === "pending" && "text-muted-foreground/60",
                  status === "error" && "text-destructive",
                )}
              >
                {step.label}
              </span>
              {status === "active" ? (
                <span
                  aria-label="Loading"
                  className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      {currentStep === "error" ? (
        <p className="text-xs text-destructive">Research failed. Please try again.</p>
      ) : null}
    </section>
  );
}
