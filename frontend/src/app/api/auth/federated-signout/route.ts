/** Federated sign-out: clears local auth cookies; optionally redirects to M2 Auth logout. */
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import { serverEnv } from "@/lib/env.server";

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

const AUTH_LOGOUT_URL = "https://auth.manumustudio.com/oauth/logout";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const searchParams = request.nextUrl.searchParams;
  const localOnly = searchParams.get("local_only") === "1";

  const cookiesToClear = [
    ...SESSION_COOKIE_NAMES,
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "authjs.csrf-token",
    "__Secure-authjs.csrf-token",
  ];

  let redirectUrl: string;
  if (localOnly) {
    redirectUrl = serverEnv.APP_URL;
  } else {
    let idToken: string | undefined;
    for (const cookieName of SESSION_COOKIE_NAMES) {
      const sessionCookie = cookieStore.get(cookieName);
      if (!sessionCookie?.value) continue;
      try {
        const decoded = await decode({
          token: sessionCookie.value,
          secret: serverEnv.NEXTAUTH_SECRET,
          salt: cookieName,
        });
        idToken = decoded?.idToken as string | undefined;
        break;
      } catch {
        /* try next cookie */
      }
    }
    const logoutUrl = new URL(AUTH_LOGOUT_URL);
    if (idToken) {
      logoutUrl.searchParams.set("id_token_hint", idToken);
    } else {
      logoutUrl.searchParams.set("client_id", serverEnv.AUTH_CLIENT_ID);
    }
    logoutUrl.searchParams.set("post_logout_redirect_uri", serverEnv.APP_URL);
    redirectUrl = logoutUrl.toString();
  }

  const response = NextResponse.redirect(redirectUrl);

  for (const cookieName of cookiesToClear) {
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      path: "/",
      secure: cookieName.startsWith("__Secure-"),
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}
