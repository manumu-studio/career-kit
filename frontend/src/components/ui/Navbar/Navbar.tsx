/** Navbar — fixed top bar with glass blur, nav links, language, theme, user menu. */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useNavbar } from "./useNavbar";
import type { NavbarProps } from "./Navbar.types";

const NAV_ITEMS = [
  { href: "/home", key: "home" as const },
  { href: "/history", key: "history" as const },
  { href: "/compare", key: "compare" as const },
] as const;

function NavLinks({ onClick }: { onClick?: () => void }) {
  const t = useTranslations("navbar");
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, key }) => {
        const isActive =
          href === "/home"
            ? pathname === "/home" || pathname === "/"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
            className={cn(
              "block rounded-md px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-primary/10 text-primary border-l-2 border-primary -ml-px pl-[11px]"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {t(key)}
          </Link>
        );
      })}
    </div>
  );
}

const LOGO_BLACK = "/assets/logo-black.webp";
const LOGO_WHITE = "/assets/logo-white.webp";

export function Navbar({ mode, userName, userEmail, className }: NavbarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const t = useTranslations("navbar");
  const tCommon = useTranslations("common");
  const tUserBar = useTranslations("userBar");
  const { mobileOpen, openMobile, closeMobile } = useNavbar();
  const logoSrc =
    !mounted ? LOGO_BLACK : resolvedTheme === "dark" ? LOGO_WHITE : LOGO_BLACK;
  const displayName = userName ?? userEmail ?? tCommon("user");
  const showNavLinks = mode === "app";

  const handleSignOut = () => {
    window.location.href = "/api/auth/federated-signout";
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 flex h-14 min-h-[3.5rem] items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md sm:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          aria-label={tCommon("appName")}
        >
          <Image
            src={logoSrc}
            alt=""
            width={160}
            height={44}
            className="h-10 w-auto object-contain sm:h-12"
            priority
          />
          <span className="text-lg font-semibold text-foreground hidden sm:inline">
            {tCommon("appName")}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {mode === "public" ? (
          <>
            <LanguageSwitcher />
            <ThemeToggle
              lightLabel={t("themeLight")}
              darkLabel={t("themeDark")}
            />
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={openMobile}
            aria-label={t("openMenu")}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
        )}
      </div>

      {mode === "app" && (
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && closeMobile()}>
        <SheetContent
          side="left"
          className="flex w-[min(85vw,20rem)] flex-col gap-0 p-0 sm:w-72"
        >
          <SheetHeader className="shrink-0 border-b border-border px-5 py-4 pr-12">
            <SheetTitle className="flex items-center gap-2">
              <Image
                src={logoSrc}
                alt=""
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
            {showNavLinks && (
              <nav
                className="flex flex-col gap-1"
                aria-label={t("navAriaLabel")}
              >
                <NavLinks onClick={closeMobile} />
              </nav>
            )}
            {showNavLinks && (
              <div className="mt-auto flex flex-col gap-3 border-t border-border pt-6">
                <span className="text-sm text-muted-foreground">
                  {tUserBar("signedInAs")} {displayName}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    closeMobile();
                    handleSignOut();
                  }}
                >
                  {tUserBar("signOut")}
                </Button>
              </div>
            )}
            <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
              <LanguageSwitcher />
              <ThemeToggle
                lightLabel={t("themeLight")}
                darkLabel={t("themeDark")}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      )}
    </header>
  );
}
