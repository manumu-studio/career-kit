/** Localized 404 page for unknown routes within [locale]. */
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
      <p className="text-slate-400">{t("description")}</p>
      <Link
        href="/home"
        className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
      >
        {t("backToHome")}
      </Link>
    </main>
  );
}
