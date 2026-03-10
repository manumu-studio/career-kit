/** Public landing page — hero, features, sign-in CTA. */
import { getTranslations } from "next-intl/server";
import { auth, signIn } from "@/features/auth/auth";
import { Link as LocaleLink } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProvidersSection } from "@/components/landing/ProvidersSection";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";
import { Footer } from "@/components/ui/Footer";

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

  const gradientButtonClass =
    "w-full animate-ai-gradient border-0 bg-clip-padding text-white hover:opacity-90 sm:w-auto sm:px-8";

  const primaryCta = session?.user ? (
    <LocaleLink href="/home">
      <Button size="lg" className={gradientButtonClass}>
        {t("goToApp")}
      </Button>
    </LocaleLink>
  ) : (
    <form
      action={async () => {
        "use server";
        await signIn("manumustudio", { callbackUrl });
      }}
    >
      <Button type="submit" size="lg" className={gradientButtonClass}>
        {t("ctaPrimary")}
      </Button>
    </form>
  );

  const ctaFooterPrimaryCta = session?.user ? (
    <LocaleLink href="/home">
      <Button size="lg" className={gradientButtonClass}>
        {t("goToApp")}
      </Button>
    </LocaleLink>
  ) : (
    <form
      action={async () => {
        "use server";
        await signIn("manumustudio", { callbackUrl });
      }}
    >
      <Button type="submit" size="lg" className={gradientButtonClass}>
        {t("ctaFooterButton")}
      </Button>
    </form>
  );

  return (
    <>
      <LandingHero
        primaryCta={primaryCta}
        heroTitle={t("heroTitle")}
        heroSubtitle={t("heroSubtitle")}
        ctaSecondaryLabel={t("ctaSecondary")}
        socialProof={t("socialProof")}
      />

      {error && !session?.user ? (
        <div
          className="mx-auto max-w-md px-4 pb-8"
          role="alert"
          aria-live="polite"
        >
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {t("authFailed")}
          </div>
        </div>
      ) : null}

      <FeatureShowcase />
      <HowItWorks />
      <ProvidersSection />
      <CtaFooterSection primaryCta={ctaFooterPrimaryCta} />
      <Footer
        homeLabel={t("footerHome")}
        privacyLabel={t("footerPrivacy")}
        termsLabel={t("footerTerms")}
        creditText={t("footerCredit")}
      />
    </>
  );
}
