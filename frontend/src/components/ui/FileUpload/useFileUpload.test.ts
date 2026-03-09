/** Hook tests for file upload state and validation flows. */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type React from "react";
import { useFileUpload } from "@/components/ui/FileUpload/useFileUpload";

function createDropEvent(file: File): React.DragEvent {
  return {
    preventDefault: () => {},
    dataTransfer: { files: [file] },
  } as unknown as React.DragEvent;
}

function createChangeEvent(file: File): React.ChangeEvent<HTMLInputElement> {
  return {
    target: { files: [file] },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe("useFileUpload", () => {
  it("starts with no file selected", () => {
    const { result } = renderHook(() => useFileUpload());
    expect(result.current.file).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isDragging).toBe(false);
  });

  it("sets selected PDF file", () => {
    const { result } = renderHook(() => useFileUpload());
    const file = new File(["content"], "resume.pdf", { type: "application/pdf" });

    act(() => {
      result.current.handleFileSelect(createChangeEvent(file));
    });

    expect(result.current.file).toEqual(file);
    expect(result.current.error).toBeNull();
  });

  it("clears file state on remove", () => {
    const { result } = renderHook(() => useFileUpload());
    const file = new File(["content"], "resume.pdf", { type: "application/pdf" });

    act(() => {
      result.current.handleDrop(createDropEvent(file));
    });
    act(() => {
      result.current.removeFile();
    });

    expect(result.current.file).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isDragging).toBe(false);
  });

  it("rejects non-pdf files", () => {
    const { result } = renderHook(() => useFileUpload());
    const file = new File(["content"], "resume.txt", { type: "text/plain" });

    act(() => {
      result.current.handleFileSelect(createChangeEvent(file));
    });

    expect(result.current.file).toBeNull();
    expect(result.current.error).toBe("Only PDF files are accepted.");
  });

  it("rejects files larger than 5MB", () => {
    const { result } = renderHook(() => useFileUpload());
    const tooLarge = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "resume.pdf", {
      type: "application/pdf",
    });

    act(() => {
      result.current.handleFileSelect(createChangeEvent(tooLarge));
    });

    expect(result.current.file).toBeNull();
    expect(result.current.error).toBe("File must be under 5MB.");
  });
});
