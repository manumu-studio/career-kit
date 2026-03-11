/** Temporary debug endpoint — returns what auth() sees. Development only. */
import { auth } from "@/features/auth/auth";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const session = await auth();
  const cookieStore = await cookies();
  const headerStore = await headers();

  /** Cookie names only — no values for security. */
  const cookieNames = cookieStore.getAll().map((c) => c.name);

  return NextResponse.json({
    hasSession: !!session,
    hasUser: !!session?.user,
    hasExternalId: !!session?.user?.externalId,
    externalId: session?.user?.externalId ?? null,
    email: session?.user?.email ?? null,
    expires: session?.expires ?? null,
    cookieNames,
    host: headerStore.get("host"),
    authSecretSet: !!process.env.AUTH_SECRET,
    nextauthSecretSet: !!process.env.NEXTAUTH_SECRET,
    authUrlSet: !!process.env.AUTH_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}
