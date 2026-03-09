/** React error boundary with fallback UI and Try Again button. */
"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import type { ErrorBoundaryProps } from "./ErrorBoundary.types";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const DEFAULT_FALLBACK = (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
    <h2 className="text-xl font-semibold text-slate-100">
      Something went wrong
    </h2>
    <p className="max-w-md text-center text-slate-400">
      An unexpected error occurred. Please try again.
    </p>
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
      aria-label="Reload the page to try again"
    >
      Try Again
    </button>
  </div>
);

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console -- intentional for debugging; Sentry in future
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return DEFAULT_FALLBACK;
    }

    return this.props.children;
  }
}
