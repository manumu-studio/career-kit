/** Public landing page with sign-in CTA or dashboard link. */
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth, signIn } from "@/features/auth/auth";
import { Link as LocaleLink } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function LandingPage({
  params,
  searchParams,
}: LandingPageProps) {
  const session = await auth();
  const { locale } = await params;
  const { error } = await searchParams;
  const t = await getTranslations("landing");

  const callbackUrl = `/${locale}/home`;

  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 md:py-16">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-8">
          {session?.user ? (
            <LocaleLink href="/home">
              <Button size="lg" className="w-full sm:w-auto sm:px-8">
                {t("goToApp")}
              </Button>
            </LocaleLink>
          ) : (
            <>
              {error ? (
                <div className="mx-auto mb-6 max-w-md rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  {t("authFailed")}
                </div>
              ) : null}

              <form
                action={async () => {
                  "use server";
                  await signIn("manumustudio", { callbackUrl });
                }}
                className="mx-auto max-w-md"
              >
                <Button type="submit" size="lg" className="w-full sm:px-8">
                  {t("signIn")}
                </Button>
              </form>

              <p className="mt-4 text-sm text-muted-foreground">
                {t("noAccount")}{" "}
                <Link
                  href="/api/auth/signup"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {t("createAccount")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
