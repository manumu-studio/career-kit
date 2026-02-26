/** Unit tests for runtime environment validation. */
import { afterEach, describe, expect, it, vi } from "vitest";

describe("env", () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    if (typeof originalApiUrl === "string") {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
    vi.resetModules();
  });

  it("parses a valid API URL", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
    const envModule = await import("@/lib/env");
    expect(envModule.env.NEXT_PUBLIC_API_URL).toBe("http://localhost:8000");
  });

  it("throws for missing NEXT_PUBLIC_API_URL", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    await expect(import("@/lib/env")).rejects.toThrow();
  });

  it("throws for invalid URL format", async () => {
    process.env.NEXT_PUBLIC_API_URL = "not-a-url";
    await expect(import("@/lib/env")).rejects.toThrow();
  });
});
