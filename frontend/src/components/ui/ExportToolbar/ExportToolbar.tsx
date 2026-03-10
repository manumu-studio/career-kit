"use client";

/** Download buttons for CV and cover letter PDF export. */
import { pdf } from "@react-pdf/renderer";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
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
    <div className="flex flex-wrap gap-3">
      <button
        aria-label={t("downloadCv")}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        disabled={cvLoading}
        onClick={() => void handleDownloadCv()}
        type="button"
      >
        {cvLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            {t("generating")}
          </>
        ) : (
          t("downloadCv")
        )}
      </button>
      <button
        aria-label={t("downloadCoverLetter")}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        disabled={!coverLetter || letterLoading}
        onClick={() => void handleDownloadLetter()}
        type="button"
      >
        {letterLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            {t("generating")}
          </>
        ) : (
          t("downloadCoverLetter")
        )}
      </button>
    </div>
  );
}
