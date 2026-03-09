/**
 * Auth feature exports — client-safe only.
 * Server code must import auth, signIn, signOut from "@/features/auth/auth" directly.
 * Re-exporting auth here would pull env.server.ts into the client bundle, causing
 * "AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, NEXTAUTH_SECRET required" in production.
 */
export { useSession } from "./useSession";
export type { Session } from "next-auth";
