/** State management hook for PDF drag/drop upload interactions. */
import { useState } from "react";
import type React from "react";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface UseFileUploadReturn {
  file: File | null;
  isDragging: boolean;
  error: string | null;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
}

function validateFile(file: File): string | null {
  const isPdfMimeType = file.type === "application/pdf";
  const isPdfExtension = file.name.toLowerCase().endsWith(".pdf");

  if (!isPdfMimeType && !isPdfExtension) {
    return "Only PDF files are supported.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File size must be 5MB or less.";
  }

  return null;
}

export function useFileUpload(): UseFileUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Centralized selection handler used by drag/drop and browse input.
  const selectFile = (nextFile: File): void => {
    const validationError = validateFile(nextFile);
    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }

    setFile(nextFile);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) {
      return;
    }

    selectFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    selectFile(selectedFile);
  };

  const removeFile = (): void => {
    setFile(null);
    setError(null);
    setIsDragging(false);
  };

  return {
    file,
    isDragging,
    error,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileSelect,
    removeFile,
  };
}
