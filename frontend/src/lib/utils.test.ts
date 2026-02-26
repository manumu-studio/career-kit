/** Unit tests for class name utility helpers. */
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("text-sm", "font-medium")).toBe("text-sm font-medium");
  });

  it("handles conditional classes and ignores falsy values", () => {
    expect(cn("base", false && "hidden", undefined, "active")).toBe("base active");
  });

  it("resolves tailwind conflicts by keeping the latest class", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});
