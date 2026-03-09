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
