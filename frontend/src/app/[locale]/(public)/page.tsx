/** Public landing page — hero, features, sign-in CTA. */
import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth, signIn } from "@/features/auth/auth";
import { getFirstNameForGreeting } from "@/lib/name-utils";
import { cn } from "@/lib/utils";
import { LinkWithSpinner } from "@/components/ui/LinkWithSpinner";
import { SubmitButtonWithSpinner } from "@/components/ui/SubmitButtonWithSpinner";
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
  // Gracefully handle stale/invalid JWT cookies (e.g. after AUTH_SECRET rotation)
  const session = await auth().catch((error: unknown) => {
    console.error("[auth] session retrieval failed:", error);
    return null;
  });
  const { locale } = await params;
  const { error } = await searchParams;
  const t = await getTranslations("landing");

  const callbackUrl = `/${locale}/home`;
  const tailorCallbackUrl = `/${locale}/home?mode=tailor`;

  const gradientButtonClass =
    "w-full animate-ai-gradient border-0 bg-clip-padding text-white hover:opacity-90 sm:w-auto sm:px-8";

  const primaryCta = session?.user ? (
    <LinkWithSpinner
      href="/home"
      useLocale
      className={cn(
        "h-9 min-h-9 rounded-lg px-2.5 font-medium sm:px-8",
        gradientButtonClass,
      )}
    >
      {t("ctaPrimary")}
    </LinkWithSpinner>
  ) : (
    <form
      action={async () => {
        "use server";
        await signIn("manumustudio", { callbackUrl });
      }}
    >
      <SubmitButtonWithSpinner size="lg" className={gradientButtonClass}>
        {t("ctaPrimary")}
      </SubmitButtonWithSpinner>
    </form>
  );

  const secondaryCtaOutlineClass =
    "h-9 min-w-[180px] rounded-lg border-2 border-border bg-background px-2.5 font-medium transition-colors hover:bg-muted hover:text-foreground";

  const tailorLabel = (
    <>
      <Sparkles className="size-4" aria-hidden />
      {t("ctaSecondaryTailor")}
    </>
  );

  const secondaryCta = session?.user ? (
    <LinkWithSpinner
      href="/home?mode=tailor"
      useLocale
      className={cn(
        "flex items-center justify-center gap-2",
        secondaryCtaOutlineClass,
      )}
    >
      {tailorLabel}
    </LinkWithSpinner>
  ) : (
    <form
      action={async () => {
        "use server";
        await signIn("manumustudio", { callbackUrl: tailorCallbackUrl });
      }}
    >
      <SubmitButtonWithSpinner
        variant="outline"
        size="lg"
        className={cn("flex items-center justify-center gap-2", secondaryCtaOutlineClass)}
      >
        {tailorLabel}
      </SubmitButtonWithSpinner>
    </form>
  );

  const welcomeBackText = session?.user?.name
    ? t("welcomeBack", { name: getFirstNameForGreeting(session.user.name) })
    : undefined;

  const ctaFooterPrimaryCta = session?.user ? (
    <LinkWithSpinner
      href="/home"
      useLocale
      className={cn(
        "h-9 min-h-9 rounded-lg px-2.5 font-medium sm:px-8",
        gradientButtonClass,
      )}
    >
      {t("goToApp")}
    </LinkWithSpinner>
  ) : (
    <form
      action={async () => {
        "use server";
        await signIn("manumustudio", { callbackUrl });
      }}
    >
      <SubmitButtonWithSpinner size="lg" className={gradientButtonClass}>
        {t("ctaFooterButton")}
      </SubmitButtonWithSpinner>
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
        welcomeBackText={welcomeBackText}
        secondaryCta={secondaryCta}
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
