/** Site footer — logo, links, credit. */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Link } from "@/i18n/navigation";
import type { FooterProps } from "./Footer.types";

const LOGO_BLACK = "/assets/logo-black.webp";
const LOGO_WHITE = "/assets/logo-white.webp";

export function Footer({
  homeLabel,
  privacyLabel,
  termsLabel,
  creditText,
}: FooterProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const logoSrc =
    !mounted ? LOGO_BLACK : resolvedTheme === "dark" ? LOGO_WHITE : LOGO_BLACK;
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-border bg-background py-8"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          aria-label={homeLabel}
        >
          <Image
            src={logoSrc}
            alt=""
            width={120}
            height={36}
            className="h-8 w-auto object-contain opacity-80"
          />
        </Link>

        <nav
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          aria-label="Footer navigation"
        >
          <Link
            href="/"
            className="hover:text-foreground transition-colors"
          >
            {homeLabel}
          </Link>
          <Link
            href="/"
            className="hover:text-foreground transition-colors"
          >
            {privacyLabel}
          </Link>
          <Link
            href="/"
            className="hover:text-foreground transition-colors"
          >
            {termsLabel}
          </Link>
        </nav>

        <p className="text-center text-xs text-muted-foreground">
          {creditText} · {year}
        </p>
      </div>
    </footer>
  );
}
