/** Root 404 page for non-localized or unmatched routes. */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NOT_FOUND_MESSAGES = {
  en: {
    title: "Page not found",
    description: "The page you are looking for does not exist.",
    goToApp: "Go to app",
  },
  es: {
    title: "Página no encontrada",
    description: "La página que buscas no existe.",
    goToApp: "Ir a la app",
  },
} as const;

export default function NotFound() {
  const [locale, setLocale] = useState<"en" | "es">("en");

  useEffect(() => {
    const lang = typeof navigator !== "undefined" ? navigator.language : "en";
    setLocale(lang.startsWith("es") ? "es" : "en");
  }, []);

  const t = NOT_FOUND_MESSAGES[locale];
  const homeHref = locale === "es" ? "/es" : "/en";

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-2xl font-semibold text-white">{t.title}</h1>
        <p className="text-slate-400">{t.description}</p>
        <Link
          href={homeHref}
          className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          {t.goToApp}
        </Link>
      </body>
    </html>
  );
}
