/** Component tests for file upload interactions and callbacks. */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "@/components/ui/FileUpload";

function getFileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Expected a file input element.");
  }
  return input;
}

describe("FileUpload", () => {
  it("renders the upload area", () => {
    const onFileChange = vi.fn();
    render(<FileUpload onFileChange={onFileChange} />);
    expect(screen.getByText("Upload Your CV (PDF)")).toBeInTheDocument();
    expect(screen.getByText("Drag and drop your PDF here")).toBeInTheDocument();
  });

  it("calls onFileChange with selected file and displays file name", async () => {
    const user = userEvent.setup();
    const onFileChange = vi.fn();
    const { container } = render(<FileUpload onFileChange={onFileChange} />);
    const input = getFileInput(container);
    const file = new File(["content"], "resume.pdf", { type: "application/pdf" });

    await user.upload(input, file);

    expect(onFileChange).toHaveBeenLastCalledWith(file);
    expect(screen.getByText("resume.pdf")).toBeInTheDocument();
  });

  it("calls onFileChange with null when file is removed", async () => {
    const user = userEvent.setup();
    const onFileChange = vi.fn();
    const { container } = render(<FileUpload onFileChange={onFileChange} />);
    const input = getFileInput(container);
    const file = new File(["content"], "resume.pdf", { type: "application/pdf" });

    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "Remove file" }));

    expect(onFileChange).toHaveBeenLastCalledWith(null);
  });
});
