/** TEMPORARY debug endpoint — remove after diagnosing auth issue */
import { auth } from "@/features/auth/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  return NextResponse.json({
    hasSession: !!session,
    hasUser: !!session?.user,
    hasExternalId: !!session?.user?.externalId,
    userName: session?.user?.name ?? null,
    externalId: session?.user?.externalId ?? null,
    fullSession: session,
  });
}
