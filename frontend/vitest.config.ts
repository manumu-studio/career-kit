/** Vitest configuration for frontend unit and component tests. */
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:8000",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/components/**/*.{ts,tsx}",
        "src/context/**/*.{ts,tsx}",
        "src/lib/**/*.ts",
      ],
      exclude: [
        "src/**/*.types.ts",
        "src/**/index.ts",
        "src/test/**",
        "src/app/**",
        "src/features/**",
        "src/types/**",
        "src/lib/env.server.ts",
        // Thin wrappers and primitives — tested via integration
        "src/components/providers/**",
        "src/components/ui/badge.tsx",
        "src/components/ui/button.tsx",
        "src/components/ui/card.tsx",
        "src/components/ui/dialog.tsx",
        "src/components/ui/dropdown-menu.tsx",
        "src/components/ui/input.tsx",
        "src/components/ui/select.tsx",
        "src/components/ui/separator.tsx",
        "src/components/ui/sheet.tsx",
        "src/components/ui/skeleton.tsx",
        "src/components/ui/textarea.tsx",
        "src/components/ui/toggle.tsx",
        "src/components/ui/tooltip.tsx",
        "src/components/ui/ErrorBoundary/**",
        "src/components/ui/FormField/**",
        "src/components/ui/LinkWithSpinner/**",
        "src/components/ui/LoadingSkeleton/**",
        "src/components/ui/Navbar/**",
        "src/components/ui/PageTransition/**",
        "src/components/ui/ProgressBar/**",
        "src/components/ui/SubmitButtonWithSpinner/**",
        // Landing page — presentational, tested via E2E
        "src/components/landing/**",
        "src/components/ui/AnimatedText/**",
        "src/components/ui/FeatureCard/**",
        "src/components/ui/StepCard/**",
        "src/components/ui/Footer/**",
        "src/components/ui/ThemeToggle/**",
        "src/components/ui/Toast/**",
        "src/lib/validation.ts",
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
