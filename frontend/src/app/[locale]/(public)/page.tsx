/** Public landing page with sign-in CTA or dashboard link. */
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth, signIn } from "@/features/auth/auth";
import { Link as LocaleLink } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

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
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white">{t("title")}</h1>
        <p className="mt-4 text-lg text-slate-300">{t("subtitle")}</p>

        <div className="mt-8">
          {session?.user ? (
            <LocaleLink
              href="/home"
              className="inline-block rounded-lg bg-sky-500 px-8 py-3 text-lg font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              {t("goToApp")}
            </LocaleLink>
          ) : (
            <>
              {error ? (
                <div className="mx-auto mb-6 max-w-md rounded-md border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
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
                <button
                  type="submit"
                  className="w-full rounded-lg bg-sky-500 px-8 py-3 text-lg font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  {t("signIn")}
                </button>
              </form>

              <p className="mt-4 text-sm text-slate-400">
                {t("noAccount")}{" "}
                <Link href="/api/auth/signup" className="text-sky-400 hover:underline">
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
