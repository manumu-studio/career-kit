"use client";

/** Toggle between EN and ES locales; persists preference via next-intl cookie. */
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { LanguageSwitcherProps } from "./LanguageSwitcher.types";

const LOCALES = [
  { code: "en" as const, label: "EN" },
  { code: "es" as const, label: "ES" },
] as const;

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleSwitch = (locale: "en" | "es") => {
    if (locale === currentLocale) return;
    router.replace(pathname, { locale });
  };

  return (
    <div
      className={cn("flex rounded-md border border-border bg-muted/60", className)}
      role="group"
      aria-label="Switch language"
    >
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => handleSwitch(code)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium transition",
            currentLocale === code
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={currentLocale === code}
          aria-label={`Switch to ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
