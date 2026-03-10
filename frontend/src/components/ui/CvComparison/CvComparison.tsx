/** Displays original and optimized CV sections side-by-side with sync scroll or tabs. */
"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { CvComparisonProps } from "@/components/ui/CvComparison/CvComparison.types";
import { useCvComparison } from "@/components/ui/CvComparison/useCvComparison";

function useSyncedScroll() {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const isSyncing = useRef(false);

  const syncLeftToRight = useCallback(() => {
    if (isSyncing.current || !leftRef.current || !rightRef.current) return;
    isSyncing.current = true;
    rightRef.current.scrollTop = leftRef.current.scrollTop;
    rightRef.current.scrollLeft = leftRef.current.scrollLeft;
    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, []);

  const syncRightToLeft = useCallback(() => {
    if (isSyncing.current || !leftRef.current || !rightRef.current) return;
    isSyncing.current = true;
    leftRef.current.scrollTop = rightRef.current.scrollTop;
    leftRef.current.scrollLeft = rightRef.current.scrollLeft;
    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, []);

  return { leftRef, rightRef, syncLeftToRight, syncRightToLeft };
}

export function CvComparison({ sections }: Readonly<CvComparisonProps>) {
  const t = useTranslations("results");
  const { success: toastSuccess } = useToast();
  const { changesLabel } = useCvComparison(t);
  const [activeTab, setActiveTab] = useState<"original" | "optimized">("original");
  const [copiedPanel, setCopiedPanel] = useState<string | null>(null);
  const { leftRef, rightRef, syncLeftToRight, syncRightToLeft } = useSyncedScroll();

  const originalText = sections
    .map((s) => `${s.heading}\n${s.original}`)
    .join("\n\n");
  const optimizedText = sections
    .map((s) => `${s.heading}\n${s.optimized}`)
    .join("\n\n");

  const handleCopy = useCallback(
    async (text: string, panel: "original" | "optimized") => {
      await navigator.clipboard.writeText(text);
      setCopiedPanel(panel);
      toastSuccess(t("copied"));
      setTimeout(() => setCopiedPanel(null), 1500);
    },
    [toastSuccess, t],
  );

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{t("cvComparison")}</h2>
        <p className="text-sm text-muted-foreground">{t("cvComparisonSubtitle")}</p>
      </div>

      {/* Mobile tabs */}
      <div className="flex gap-2 md:hidden">
        <Button
          variant={activeTab === "original" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("original")}
        >
          {t("originalCv")}
        </Button>
        <Button
          variant={activeTab === "optimized" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("optimized")}
        >
          {t("optimizedCv")}
        </Button>
      </div>

      {/* Desktop: side-by-side with sync scroll */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("originalCv")}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => void handleCopy(originalText, "original")}
            >
              {copiedPanel === "original" ? (
                <Check className="h-4 w-4 text-success" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
          <div
            ref={leftRef}
            onScroll={syncLeftToRight}
            className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground"
          >
            {originalText}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("optimizedCv")}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => void handleCopy(optimizedText, "optimized")}
            >
              {copiedPanel === "optimized" ? (
                <Check className="h-4 w-4 text-success" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
          <div
            ref={rightRef}
            onScroll={syncRightToLeft}
            className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground"
          >
            {optimizedText}
          </div>
        </div>
      </div>

      {/* Mobile: single panel based on tab */}
      <div className="space-y-4 md:hidden">
        {sections.map((section) => (
          <article
            key={section.heading}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              {section.heading}
            </h3>
            <div className="space-y-2">
              {activeTab === "original" ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {section.original}
                </p>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {section.optimized}
                </p>
              )}
            </div>
            {section.changes_made.length > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {changesLabel}
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {section.changes_made.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
