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
    bg: "bg-emerald-900/95 border-emerald-700",
    border: "border-emerald-700",
    icon: "✓",
  },
  error: {
    bg: "bg-red-900/95 border-red-700",
    border: "border-red-700",
    icon: "✕",
  },
  warning: {
    bg: "bg-amber-900/95 border-amber-700",
    border: "border-amber-700",
    icon: "!",
  },
  info: {
    bg: "bg-sky-900/95 border-sky-700",
    border: "border-sky-700",
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
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold"
        aria-hidden
      >
        {styles.icon}
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium text-slate-100">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Dismiss notification"
      >
        <span aria-hidden>×</span>
      </button>
    </div>
  );
}
