/** NextAuth API route handler — with temporary error logging for production debug. */
import { handlers } from "@/features/auth/auth";
import { NextRequest, NextResponse } from "next/server";

/** Wrap GET to log callback errors that NextAuth swallows silently. */
async function wrappedGET(req: NextRequest) {
  const url = new URL(req.url);
  const isCallback = url.pathname.includes("/callback/");

  if (isCallback) {
    console.log("[auth-debug] Callback hit", {
      url: req.url,
      searchParams: Object.fromEntries(url.searchParams),
      cookies: req.cookies.getAll().map((c) => c.name),
    });
  }

  try {
    const response = await handlers.GET(req);
    if (isCallback) {
      const setCookies = response.headers.getSetCookie();
      console.log("[auth-debug] Callback response", {
        status: response.status,
        location: response.headers.get("location"),
        setCookieNames: setCookies.map((c) => c.split("=")[0]),
      });
    }
    return response;
  } catch (error) {
    console.error("[auth-debug] Callback ERROR", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown auth error" },
      { status: 500 },
    );
  }
}

export { wrappedGET as GET };
export const { POST } = handlers;
