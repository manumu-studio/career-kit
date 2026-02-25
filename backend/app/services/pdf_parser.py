"""PDF text extraction service using pdfplumber."""

from __future__ import annotations

import io
import re
from collections import Counter

import pdfplumber
from fastapi import UploadFile

from app.core.config import settings

PDF_MAGIC_BYTES = b"%PDF-"


def _strip_repeated_headers_and_footers(page_texts: list[str]) -> list[str]:
    """Remove repeated first/last lines likely acting as headers/footers."""
    if len(page_texts) < 2:
        return page_texts

    first_lines: list[str] = []
    last_lines: list[str] = []

    for page_text in page_texts:
        lines = [line.strip() for line in page_text.splitlines() if line.strip()]
        if not lines:
            continue
        first_lines.append(lines[0])
        last_lines.append(lines[-1])

    repeated_header = ""
    repeated_footer = ""

    first_counts = Counter(first_lines)
    last_counts = Counter(last_lines)

    if first_counts:
        header_candidate, count = first_counts.most_common(1)[0]
        if count >= 2:
            repeated_header = header_candidate

    if last_counts:
        footer_candidate, count = last_counts.most_common(1)[0]
        if count >= 2:
            repeated_footer = footer_candidate

    cleaned_pages: list[str] = []
    for page_text in page_texts:
        lines = [line.rstrip() for line in page_text.splitlines()]

        if repeated_header:
            while lines and not lines[0].strip():
                lines.pop(0)
            if lines and lines[0].strip() == repeated_header:
                lines.pop(0)

        if repeated_footer:
            while lines and not lines[-1].strip():
                lines.pop()
            if lines and lines[-1].strip() == repeated_footer:
                lines.pop()

        cleaned_pages.append("\n".join(lines))

    return cleaned_pages


def _normalize_page_text(page_text: str) -> str:
    """Normalize spacing while keeping paragraph separation intact."""
    normalized_lines: list[str] = []
    previous_blank = False

    for raw_line in page_text.splitlines():
        compact_line = re.sub(r"\s+", " ", raw_line).strip()

        if not compact_line:
            if not previous_blank:
                normalized_lines.append("")
            previous_blank = True
            continue

        normalized_lines.append(compact_line)
        previous_blank = False

    return "\n".join(normalized_lines).strip()


async def extract_text_from_pdf(file: UploadFile) -> str:
    """Extract text content from an uploaded PDF file.

    Args:
        file: FastAPI UploadFile containing a PDF.

    Returns:
        Extracted text with page breaks preserved.

    Raises:
        ValueError: If file is empty, invalid, too large, or has no extractable text.
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise ValueError("Uploaded file is empty.")

    max_size_bytes = settings.max_file_size_mb * 1024 * 1024
    if len(file_bytes) > max_size_bytes:
        raise ValueError(
            f"File exceeds maximum size of {settings.max_file_size_mb} MB."
        )

    if not file_bytes.startswith(PDF_MAGIC_BYTES):
        raise ValueError("Uploaded file is not a valid PDF.")

    page_texts: list[str] = []

    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            if not pdf.pages:
                raise ValueError("PDF contains no pages.")

            for page in pdf.pages:
                extracted_text = page.extract_text() or ""
                page_texts.append(extracted_text)
    except ValueError:
        raise
    except Exception as exc:  # pragma: no cover - defensive parser error handling
        raise ValueError("Failed to parse PDF file.") from exc

    cleaned_pages = _strip_repeated_headers_and_footers(page_texts)
    normalized_pages: list[str] = []
    for page_text in cleaned_pages:
        normalized_text = _normalize_page_text(page_text)
        if normalized_text:
            normalized_pages.append(normalized_text)

    if not normalized_pages:
        raise ValueError("No extractable text found in PDF.")

    return "\n\n".join(normalized_pages).strip()
