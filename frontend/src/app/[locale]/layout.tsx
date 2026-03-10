/** Locale layout — NextIntlClientProvider and locale validation. */
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { ReactNode } from "react";

const LOCALE_METADATA = {
  en: {
    title: "Career Kit by ManuMu Studio",
    description: "Optimize your CV for job applications.",
  },
  es: {
    title: "Career Kit by ManuMu Studio",
    description: "Optimiza tu CV para ofertas de empleo.",
  },
} as const satisfies Record<string, { title: string; description: string }>;

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const meta =
    (locale === "en" || locale === "es" ? LOCALE_METADATA[locale] : null) ??
    LOCALE_METADATA.en;
  return { title: meta.title, description: meta.description };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
