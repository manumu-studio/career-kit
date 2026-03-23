/** Public layout — no auth required, landing page with SEO metadata. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/ui/Navbar";

const LOCALE_OG_TITLE = {
  en: "Career Kit — Land the right job, prepared",
  es: "Career Kit — Consigue el trabajo ideal, preparado",
} as const;

type PublicLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: Pick<PublicLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const title =
    locale === "es" ? LOCALE_OG_TITLE.es : LOCALE_OG_TITLE.en;
  const description = t("heroSubtitle");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://careerkit.manumustudio.com";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      url: `${baseUrl}/${locale}`,
      images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
    },
  };
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to content
      </a>
      <Navbar mode="public" variant="transparent" />
      <main id="main-content" className="min-h-screen pt-14">
        {children}
      </main>
    </div>
  );
}
