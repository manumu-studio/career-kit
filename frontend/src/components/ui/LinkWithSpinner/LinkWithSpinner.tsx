"use client";

/** Link that shows a spinner when clicked (during navigation). */
import { useState } from "react";
import Link from "next/link";
import { Link as LocaleLink } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface LinkWithSpinnerProps
  extends Omit<React.ComponentProps<typeof Link>, "children"> {
  children: React.ReactNode;
  spinnerClassName?: string;
  /** Use locale-aware Link for internal routes (e.g. /home). Use false for API routes. */
  useLocale?: boolean;
}

export function LinkWithSpinner({
  href,
  children,
  className,
  spinnerClassName,
  onClick,
  useLocale = false,
  prefetch,
  ...props
}: LinkWithSpinnerProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsNavigating(true);
    onClick?.(e);
  };

  const spinner = (
    <span
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent",
        spinnerClassName,
      )}
      aria-hidden
    />
  );

  const commonProps = {
    className: cn("inline-flex items-center justify-center", className),
    onClick: handleClick,
    "aria-busy": isNavigating,
    children: isNavigating ? spinner : children,
  };

  if (useLocale) {
    return <LocaleLink href={href as "/home"} {...commonProps} />;
  }

  return <Link href={href} {...commonProps} prefetch={prefetch} {...props} />;
}
