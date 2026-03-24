"use client";

/** Copyable keyword chips for CV/cover-letter phrase reuse with tooltip and stagger animation. */
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { KeywordChipsProps } from "./KeywordChips.types";

const CHIP_STAGGER = 0.05;

export function KeywordChips({
  keywords,
  label = "Keywords to Mirror",
  className,
  animated = false,
  animationDelay = 0,
}: KeywordChipsProps) {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const handleCopy = async (keyword: string): Promise<void> => {
    await navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    window.setTimeout(() => {
      setCopiedKeyword((current) => (current === keyword ? null : current));
    }, 900);
  };

  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-base font-semibold text-foreground">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, i) => (
          <Tooltip key={keyword}>
            <TooltipTrigger
              render={
              <motion.span
                initial={animated && !reducedMotion ? { opacity: 0, scale: 0.8, y: 8 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={
                  animated && !reducedMotion
                    ? { delay: i * CHIP_STAGGER + animationDelay / 1000, duration: 0.2 }
                    : { duration: 0 }
                }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-foreground transition hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  role="button"
                  tabIndex={0}
                  onClick={() => void handleCopy(keyword)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void handleCopy(keyword);
                    }
                  }}
                />
              }
            >
              <span>{keyword}</span>
              <span className="text-muted-foreground">
                {copiedKeyword === keyword ? "Copied!" : "Copy"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{keyword}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </section>
  );
}
