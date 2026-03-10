/** Tests for name normalization and greeting utilities. */
import { describe, expect, it } from "vitest";
import {
  toTitleCase,
  getFirstNameForGreeting,
  normalizeDisplayName,
  displayNameSchema,
} from "./name-utils";

describe("toTitleCase", () => {
  it("converts all caps to title case", () => {
    expect(toTitleCase("JOHAN PULIDO")).toBe("Johan Pulido");
  });

  it("converts lowercase to title case", () => {
    expect(toTitleCase("johan pulido")).toBe("Johan Pulido");
  });

  it("handles single word", () => {
    expect(toTitleCase("JOHAN")).toBe("Johan");
  });

  it("trims whitespace", () => {
    expect(toTitleCase("  johan pulido  ")).toBe("Johan Pulido");
  });
});

describe("getFirstNameForGreeting", () => {
  it("returns first name only", () => {
    expect(getFirstNameForGreeting("Johan Pulido")).toBe("Johan");
  });

  it("converts first name to title case", () => {
    expect(getFirstNameForGreeting("JOHAN PULIDO")).toBe("Johan");
  });

  it("handles single name", () => {
    expect(getFirstNameForGreeting("Johan")).toBe("Johan");
  });
});

describe("normalizeDisplayName", () => {
  it("normalizes valid name", () => {
    expect(normalizeDisplayName("JOHAN PULIDO")).toBe("Johan Pulido");
  });

  it("returns null for null", () => {
    expect(normalizeDisplayName(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(normalizeDisplayName(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(normalizeDisplayName("")).toBeNull();
    expect(normalizeDisplayName("   ")).toBeNull();
  });
});

describe("displayNameSchema", () => {
  it("transforms to title case", () => {
    expect(displayNameSchema.parse("johan pulido")).toBe("Johan Pulido");
  });

  it("rejects empty string", () => {
    expect(() => displayNameSchema.parse("")).toThrow();
  });
});
