"use client";

/** PDF drag-and-drop upload component with validation feedback. */
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { FileUploadProps } from "./FileUpload.types";
import { useFileUpload } from "./useFileUpload";

function formatFileSize(bytes: number): string {
  const sizeInMb = bytes / (1024 * 1024);
  return `${sizeInMb.toFixed(2)} MB`;
}

export function FileUpload({ onFileChange }: FileUploadProps) {
  const t = useTranslations("fileUpload");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    file,
    error,
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileSelect,
    removeFile,
  } = useFileUpload();

  // Keep parent form state synchronized with component selection state.
  useEffect(() => {
    onFileChange(file);
  }, [file, onFileChange]);

  const handleRemove = (): void => {
    removeFile();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <section className="w-full space-y-3">
      <h2 className="text-lg font-semibold text-white">{t("uploadLabel")}</h2>

      <label
        aria-label={t("ariaLabel")}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition md:mx-auto md:max-w-xl md:py-10",
          isDragging ? "border-sky-400 bg-sky-500/10" : "border-slate-700 bg-slate-900/60",
        )}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          accept=".pdf,application/pdf"
          aria-describedby={error ? "file-upload-error" : undefined}
          className="hidden"
          onChange={handleFileSelect}
          type="file"
        />

        {!file ? (
          <div className="space-y-2">
            <p className="text-base font-medium text-slate-100">{t("dragDrop")}</p>
            <p className="text-sm text-slate-400">{t("clickToBrowse")}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-base font-medium text-slate-100">{file.name}</p>
            <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
          </div>
        )}
      </label>

      {file ? (
        <button
          className="text-sm font-medium text-rose-300 transition hover:text-rose-200"
          onClick={handleRemove}
          type="button"
        >
          {t("removeFile")}
        </button>
      ) : null}

      {error ? (
        <p className="text-sm text-rose-300" id="file-upload-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
