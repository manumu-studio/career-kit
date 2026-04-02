/** NextAuth configuration with ManuMuStudio OAuth/OIDC provider */
import NextAuth from "next-auth";
import { z } from "zod";
import { serverEnv } from "@/lib/env.server";
import { OidcProfileSchema } from "@/lib/schemas/auth-profile.schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: serverEnv.NEXTAUTH_SECRET,
  providers: [
    {
      id: "manumustudio",
      name: "ManuMuStudio",
      type: "oauth",
      issuer: "https://auth.manumustudio.com/",
      authorization: {
        url: "https://auth.manumustudio.com/oauth/authorize",
        params: { scope: "openid email profile" },
      },
      token: "https://auth.manumustudio.com/oauth/token",
      userinfo: "https://auth.manumustudio.com/oauth/userinfo",
      clientId: serverEnv.AUTH_CLIENT_ID,
      clientSecret: serverEnv.AUTH_CLIENT_SECRET,
      checks: ["pkce", "state"],
      profile(rawProfile: Record<string, unknown>) {
        const parsed = OidcProfileSchema.parse(rawProfile);
        return {
          id: parsed.sub,
          name: parsed.name ?? parsed.email ?? null,
          email: parsed.email ?? null,
          image: parsed.picture ?? null,
        };
      },
    },
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (profile && typeof profile === "object") {
        const record = profile as Record<string, unknown>;
        const subFromOAuth =
          typeof record.sub === "string"
            ? record.sub
            : typeof record.id === "string"
              ? record.id
              : null;
        if (subFromOAuth !== null) {
          const parsed = OidcProfileSchema.parse({ ...record, sub: subFromOAuth });
          token.externalId = parsed.sub;
          token.email = parsed.email ?? null;
          token.name = parsed.name ?? null;
        }
      }
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.externalId) {
        session.user.externalId = z.string().parse(token.externalId);
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});
