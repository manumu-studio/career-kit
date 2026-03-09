/** Context and provider for toast notifications. */
"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Toast } from "./Toast";
import type { ToastItem, ToastType } from "./Toast.types";

const MAX_VISIBLE = 3;

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => void;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
);

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `toast-${idCounter}-${Date.now()}`;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const item: ToastItem = {
      id: generateId(),
      type,
      message,
      createdAt: Date.now(),
    };
    setToasts((prev) => {
      const next = [...prev, item].slice(-MAX_VISIBLE);
      return next;
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, addToast, dismissToast }),
    [toasts, addToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 md:left-auto md:right-4 md:max-w-sm"
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
