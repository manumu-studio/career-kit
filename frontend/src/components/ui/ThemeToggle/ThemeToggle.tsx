/** ThemeToggle — sun/moon icon toggle for dark/light mode via next-themes. */
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ThemeToggleProps } from "./ThemeToggle.types";

export function ThemeToggle({
  className,
  lightLabel = "Switch to light mode",
  darkLabel = "Switch to dark mode",
}: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className={cn(className)} aria-hidden>
        <div className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleToggle}
      aria-label={isDark ? lightLabel : darkLabel}
      className={cn(className)}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? (
          <SunIcon className="size-4" aria-hidden />
        ) : (
          <MoonIcon className="size-4" aria-hidden />
        )}
      </motion.div>
    </Button>
  );
}
