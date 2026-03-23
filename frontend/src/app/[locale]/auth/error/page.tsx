/** Auth error page — displays authentication failure details. */
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

const ERROR_KEYS: Record<string, string> = {
  Configuration: "config",
  AccessDenied: "accessDenied",
  Verification: "verification",
  OAuthSignin: "oauthSignin",
  OAuthCallback: "oauthCallback",
  OAuthCreateAccount: "oauthCreateAccount",
  Callback: "callback",
  Default: "default",
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const error = params.error;
  const t = await getTranslations("auth");
  const tErrors = await getTranslations("authErrors");

  const key = error && ERROR_KEYS[error] ? ERROR_KEYS[error] : "default";
  const message = tErrors(key);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-foreground">{t("errorTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{message}</p>
        {error ? (
          <p className="mt-2 text-sm text-muted-foreground/60">Error code: {error}</p>
        ) : null}
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
