/** Types for Toast notification system. */

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => void;
  dismissToast: (id: string) => void;
}

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}
