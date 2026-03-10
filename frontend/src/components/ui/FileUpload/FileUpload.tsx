"use client";

/** PDF drag-and-drop upload component with validation feedback. */
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
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
  const reducedMotion = useReducedMotion();
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
      <h2 className="text-lg font-semibold text-foreground">{t("uploadLabel")}</h2>

      <motion.label
        aria-label={t("ariaLabel")}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center md:mx-auto md:max-w-xl md:py-10",
          "min-h-[200px]",
          isDragging ? "bg-primary/5" : "bg-muted/50",
        )}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        animate={
          reducedMotion
            ? {}
            : isDragging
              ? { scale: 1.005 }
              : { scale: [1, 1.003, 1] }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : isDragging
              ? { duration: 0.15 }
              : { duration: 2, repeat: Infinity, repeatType: "loop" }
        }
        style={{
          borderColor: isDragging ? "var(--primary)" : "var(--border)",
        }}
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
            <p className="text-base font-medium text-foreground">{t("dragDrop")}</p>
            <p className="text-sm text-muted-foreground">{t("clickToBrowse")}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        )}
      </motion.label>

      {file ? (
        <button
          className="text-sm font-medium text-destructive transition hover:text-destructive/80"
          onClick={handleRemove}
          type="button"
        >
          {t("removeFile")}
        </button>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" id="file-upload-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
