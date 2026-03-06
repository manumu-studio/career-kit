/** Server-side environment variables — auth secrets, never exposed to client bundle. */
import { z } from "zod";

const DEV_PLACEHOLDER = "local-dev-placeholder";
const DEV_SECRET = "local-dev-nextauth-secret-32-chars-minimum";

const serverEnvSchema = z.object({
  AUTH_CLIENT_ID: z.string().min(1).optional().default(DEV_PLACEHOLDER),
  AUTH_CLIENT_SECRET: z.string().min(1).optional().default(DEV_PLACEHOLDER),
  NEXTAUTH_SECRET: z.string().min(32).optional().default(DEV_SECRET),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = serverEnvSchema.parse(process.env);

if (
  process.env.NODE_ENV === "production" &&
  (parsed.AUTH_CLIENT_ID === DEV_PLACEHOLDER ||
    parsed.AUTH_CLIENT_SECRET === DEV_PLACEHOLDER ||
    parsed.NEXTAUTH_SECRET === DEV_SECRET)
) {
  throw new Error(
    "AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, and NEXTAUTH_SECRET are required in production. Copy .env.example to .env.local and set real values.",
  );
}

export const serverEnv = parsed;
