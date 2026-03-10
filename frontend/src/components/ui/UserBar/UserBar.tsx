"use client";

/** Top bar showing authenticated user identity, nav links, language switcher, and sign-out. */
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import type { UserBarProps } from "./UserBar.types";

export function UserBar({ userName, userEmail }: UserBarProps) {
  const t = useTranslations("userBar");
  const tCommon = useTranslations("common");
  const displayName = userName ?? userEmail ?? tCommon("user");

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 py-3">
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">
          {t("signedInAs")} <span className="font-medium text-slate-100">{displayName}</span>
        </span>
        <Link
          className="text-sm text-slate-400 transition hover:text-slate-200"
          href="/history"
        >
          {t("history")}
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <button
          onClick={() => {
            window.location.href = "/api/auth/federated-signout?local_only=1";
          }}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
          type="button"
        >
          {t("signOut")}
        </button>
      </div>
    </header>
  );
}
