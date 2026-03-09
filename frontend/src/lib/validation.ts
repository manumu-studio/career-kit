/** Zod schemas for form validation. */
import { z } from "zod";

export const fileValidation = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.type === "application/pdf", "Only PDF files are accepted")
    .refine((f) => f.size <= 5 * 1024 * 1024, "File must be under 5MB"),
});

export const jobDescriptionValidation = z.object({
  jobDescription: z
    .string()
    .min(50, "Job description must be at least 50 characters")
    .max(10000, "Job description must be under 10,000 characters"),
});

export type FileValidationInput = z.infer<typeof fileValidation>;
export type JobDescriptionValidationInput = z.infer<typeof jobDescriptionValidation>;
