/** Single toast notification with type-based styling and dismiss. */
"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ToastProps } from "./Toast.types";

const AUTO_DISMISS_MS = 5000;

const typeStyles: Record<
  ToastProps["toast"]["type"],
  { bg: string; border: string; icon: string }
> = {
  success: {
    bg: "bg-success/10 border-success/30",
    border: "border-success/30",
    icon: "✓",
  },
  error: {
    bg: "bg-destructive/10 border-destructive/30",
    border: "border-destructive/30",
    icon: "✕",
  },
  warning: {
    bg: "bg-warning/10 border-warning/30",
    border: "border-warning/30",
    icon: "!",
  },
  info: {
    bg: "bg-primary/10 border-primary/30",
    border: "border-primary/30",
    icon: "i",
  },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const styles = typeStyles[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm",
        styles.bg,
        styles.border,
      )}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/20 text-sm font-bold"
        aria-hidden
      >
        {styles.icon}
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Dismiss notification"
      >
        <span aria-hidden>×</span>
      </button>
    </div>
  );
}
