/** Hook to show toast notifications from any component. */
"use client";

import { useCallback, useContext } from "react";
import { ToastContext } from "./ToastContext";
import type { ToastType } from "./Toast.types";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }

  const toast = useCallback(
    (type: ToastType, message: string) => {
      ctx.addToast(type, message);
    },
    [ctx],
  );

  return {
    toast,
    success: (msg: string) => toast("success", msg),
    error: (msg: string) => toast("error", msg),
    warning: (msg: string) => toast("warning", msg),
    info: (msg: string) => toast("info", msg),
  };
}
