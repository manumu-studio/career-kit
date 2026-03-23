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
    <header className="flex items-center justify-between border-b border-border bg-muted/60 px-6 py-3">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {t("signedInAs")} <span className="font-medium text-foreground">{displayName}</span>
        </span>
        <Link
          className="text-sm text-muted-foreground transition hover:text-foreground"
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
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-border/80 hover:text-foreground"
          type="button"
        >
          {t("signOut")}
        </button>
      </div>
    </header>
  );
}
