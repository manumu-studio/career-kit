/** Shared render helpers with app-level providers for tests. */
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { OptimizationProvider } from "@/context/OptimizationContext";
import en from "../../messages/en.json";

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <OptimizationProvider>{children}</OptimizationProvider>
    </NextIntlClientProvider>
  );
}

function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: Wrapper, ...options });
}

export { renderWithProviders as render };
export * from "@testing-library/react";
