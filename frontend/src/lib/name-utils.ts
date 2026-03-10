/** Name normalization and validation — title case, greeting first name. */
import { z } from "zod";

/**
 * Converts a name string to title case: first letter of each word uppercase, rest lowercase.
 * "JOHAN PULIDO" → "Johan Pulido"
 */
export function toTitleCase(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) =>
      word.length === 0
        ? ""
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
}

/**
 * Returns the first name only (first word) in title case, for use in greetings.
 * "Johan Pulido" → "Johan"
 */
export function getFirstNameForGreeting(fullName: string): string {
  const firstWord = fullName.trim().split(/\s+/)[0];
  return firstWord ? toTitleCase(firstWord) : fullName;
}

/** Zod schema: validates and transforms name to title case. */
export const displayNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(200, "Name must be under 200 characters")
  .transform((val) => toTitleCase(val.trim()));

export type DisplayName = z.infer<typeof displayNameSchema>;

/**
 * Safely normalizes a name from OAuth profile: null/undefined/empty → null,
 * otherwise validates and transforms to title case via Zod.
 */
export function normalizeDisplayName(
  raw: string | null | undefined,
): string | null {
  if (raw == null || typeof raw !== "string" || raw.trim() === "") {
    return null;
  }
  const result = displayNameSchema.safeParse(raw.trim());
  return result.success ? result.data : toTitleCase(raw.trim());
}
