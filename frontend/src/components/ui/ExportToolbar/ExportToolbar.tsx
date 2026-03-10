"use client";

/** Floating bottom bar with download buttons for CV and cover letter PDF export. */
import { pdf } from "@react-pdf/renderer";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CoverLetterPdfDocument } from "@/components/ui/CoverLetterPdfDocument";
import { CvPdfDocument } from "@/components/ui/CvPdfDocument";
import type { ExportToolbarProps } from "./ExportToolbar.types";

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportToolbar({
  optimizationResult,
  coverLetter,
}: ExportToolbarProps) {
  const t = useTranslations("export");
  const [cvLoading, setCvLoading] = useState(false);
  const [letterLoading, setLetterLoading] = useState(false);

  const handleDownloadCv = useCallback(async () => {
    setCvLoading(true);
    try {
      const blob = await pdf(
        <CvPdfDocument optimizationResult={optimizationResult} />,
      ).toBlob();
      triggerDownload(blob, "optimized-cv.pdf");
    } finally {
      setCvLoading(false);
    }
  }, [optimizationResult]);

  const handleDownloadLetter = useCallback(async () => {
    if (!coverLetter) return;
    setLetterLoading(true);
    try {
      const blob = await pdf(
        <CoverLetterPdfDocument coverLetter={coverLetter} />,
      ).toBlob();
      triggerDownload(blob, "cover-letter.pdf");
    } finally {
      setLetterLoading(false);
    }
  }, [coverLetter]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-3">
      <Button
        className="animate-ai-gradient border-0 bg-clip-padding text-white hover:opacity-90"
        aria-label={t("downloadCv")}
        disabled={cvLoading}
        onClick={() => void handleDownloadCv()}
      >
        {cvLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {t("generating")}
          </>
        ) : (
          t("downloadCv")
        )}
      </Button>
      <Button
        variant="outline"
        aria-label={t("downloadCoverLetter")}
        disabled={!coverLetter || letterLoading}
        onClick={() => void handleDownloadLetter()}
      >
        {letterLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            {t("generating")}
          </>
        ) : (
          t("downloadCoverLetter")
        )}
      </Button>
    </div>
  );
}
