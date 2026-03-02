"use client";

/** Copyable keyword chips for CV/cover-letter phrase reuse. */
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { KeywordChipsProps } from "./KeywordChips.types";

export function KeywordChips({
  keywords,
  label = "Keywords to Mirror",
  className,
}: KeywordChipsProps) {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const handleCopy = async (keyword: string): Promise<void> => {
    await navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    window.setTimeout(() => {
      setCopiedKeyword((current) => (current === keyword ? null : current));
    }, 900);
  };

  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-base font-semibold text-slate-100">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <button
            key={keyword}
            className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            onClick={() => {
              void handleCopy(keyword);
            }}
            type="button"
          >
            <span>{keyword}</span>
            <span className="text-slate-400">{copiedKeyword === keyword ? "Copied!" : "Copy"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
