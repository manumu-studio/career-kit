/** Shared render helpers with app-level providers for tests. */
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { OptimizationProvider } from "@/context/OptimizationContext";

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <OptimizationProvider>{children}</OptimizationProvider>;
}

function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: Wrapper, ...options });
}

export { renderWithProviders as render };
export * from "@testing-library/react";
