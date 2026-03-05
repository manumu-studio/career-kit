/** Server-side environment variables — auth secrets, never exposed to client bundle. */
import { z } from "zod";

const serverEnvSchema = z.object({
  AUTH_CLIENT_ID: z.string().min(1),
  AUTH_CLIENT_SECRET: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const serverEnv = serverEnvSchema.parse(process.env);
