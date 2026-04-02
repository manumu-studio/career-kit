/** Tests for OIDC profile Zod schema. */
import { describe, expect, it } from "vitest";
import { OidcProfileSchema } from "./auth-profile.schema";

describe("OidcProfileSchema", () => {
  it("parses required sub and optional claims", () => {
    const parsed = OidcProfileSchema.parse({
      sub: "user-1",
      name: "Ada",
      email: "ada@example.com",
      picture: "https://example.com/p.png",
      extra: "ignored-by-consumer",
    });
    expect(parsed.sub).toBe("user-1");
    expect(parsed.name).toBe("Ada");
    expect(parsed.email).toBe("ada@example.com");
    expect(parsed.picture).toBe("https://example.com/p.png");
  });

  it("allows nullish name email picture", () => {
    const parsed = OidcProfileSchema.parse({ sub: "x" });
    expect(parsed.sub).toBe("x");
    expect(parsed.name).toBeUndefined();
    expect(parsed.email).toBeUndefined();
  });

  it("rejects missing sub", () => {
    expect(() => OidcProfileSchema.parse({ email: "a@b.co" })).toThrow();
  });
});
