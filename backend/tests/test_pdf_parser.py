"""Unit tests for PDF parsing service."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

import pytest
from fastapi import UploadFile

from app.core.config import settings
from app.services.pdf_parser import extract_text_from_pdf


def _escape_pdf_text(value: str) -> str:
    """Escape PDF special characters in text blocks."""
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_simple_pdf(pages: list[list[str]]) -> bytes:
    """Build a minimal multi-page PDF containing text lines."""
    objects: dict[int, str] = {
        1: "<< /Type /Catalog /Pages 2 0 R >>",
    }

    page_object_ids: list[int] = []
    content_object_ids: list[int] = []
    font_object_id = 3 + (2 * len(pages))

    for index, lines in enumerate(pages):
        page_object_id = 3 + (2 * index)
        content_object_id = page_object_id + 1
        page_object_ids.append(page_object_id)
        content_object_ids.append(content_object_id)

        escaped_lines = [_escape_pdf_text(line) for line in lines]
        text_ops: list[str] = ["BT", "/F1 12 Tf", "72 750 Td", "14 TL"]
        for line_index, line in enumerate(escaped_lines):
            if line_index == 0:
                text_ops.append(f"({line}) Tj")
            else:
                text_ops.append("T*")
                text_ops.append(f"({line}) Tj")
        text_ops.append("ET")
        stream_content = "\n".join(text_ops)

        objects[page_object_id] = (
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            f"/Contents {content_object_id} 0 R /Resources << /Font << /F1 "
            f"{font_object_id} 0 R >> >> >>"
        )
        objects[content_object_id] = (
            f"<< /Length {len(stream_content.encode('latin-1'))} >>\n"
            "stream\n"
            f"{stream_content}\n"
            "endstream"
        )

    kids = " ".join(f"{page_id} 0 R" for page_id in page_object_ids)
    objects[2] = f"<< /Type /Pages /Count {len(pages)} /Kids [ {kids} ] >>"
    objects[font_object_id] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"

    pdf_parts: list[str] = ["%PDF-1.4\n"]
    offsets: list[int] = [0]

    for object_id in range(1, font_object_id + 1):
        offsets.append(sum(len(part.encode("latin-1")) for part in pdf_parts))
        pdf_parts.append(f"{object_id} 0 obj\n{objects[object_id]}\nendobj\n")

    xref_offset = sum(len(part.encode("latin-1")) for part in pdf_parts)
    pdf_parts.append(f"xref\n0 {font_object_id + 1}\n")
    pdf_parts.append("0000000000 65535 f \n")

    for offset in offsets[1:]:
        pdf_parts.append(f"{offset:010} 00000 n \n")

    pdf_parts.append(
        "trailer\n"
        f"<< /Size {font_object_id + 1} /Root 1 0 R >>\n"
        "startxref\n"
        f"{xref_offset}\n"
        "%%EOF\n"
    )

    return "".join(pdf_parts).encode("latin-1")


def _upload_file_from_bytes(filename: str, payload: bytes) -> UploadFile:
    """Create UploadFile from bytes payload for testing."""
    return UploadFile(filename=filename, file=BytesIO(payload))


@pytest.fixture
def sample_cv_pdf_bytes() -> bytes:
    """Generate a sample multi-page CV PDF used across tests."""
    return _build_simple_pdf(
        pages=[
            [
                "Candidate Name",
                "",
                "EXPERIENCE",
                "Built API services for recruiter tooling.",
            ],
            [
                "Candidate Name",
                "",
                "SKILLS",
                "Python, FastAPI, PostgreSQL",
            ],
        ]
    )


@pytest.fixture
def ensure_fixture_directory() -> Path:
    """Ensure fixture directory exists for task compatibility."""
    fixtures_dir = Path(__file__).parent / "fixtures"
    fixtures_dir.mkdir(parents=True, exist_ok=True)
    return fixtures_dir


@pytest.mark.asyncio
async def test_extract_text_from_valid_pdf_preserves_structure(
    sample_cv_pdf_bytes: bytes, ensure_fixture_directory: Path
) -> None:
    """Valid PDF should extract headings and preserve page-level structure."""
    sample_path = ensure_fixture_directory / "sample_cv.pdf"
    sample_path.write_bytes(sample_cv_pdf_bytes)

    upload = _upload_file_from_bytes("sample_cv.pdf", sample_cv_pdf_bytes)
    text = await extract_text_from_pdf(upload)

    assert "EXPERIENCE" in text
    assert "SKILLS" in text
    assert "Built API services for recruiter tooling." in text
    assert "Python, FastAPI, PostgreSQL" in text
    assert "\n\n" in text
    assert "Candidate Name" not in text


@pytest.mark.asyncio
async def test_extract_text_from_empty_pdf_raises_value_error() -> None:
    """Empty upload should raise a descriptive ValueError."""
    upload = _upload_file_from_bytes("empty.pdf", b"")

    with pytest.raises(ValueError, match="empty"):
        await extract_text_from_pdf(upload)


@pytest.mark.asyncio
async def test_extract_text_from_non_pdf_raises_value_error() -> None:
    """Non-PDF input should fail validation."""
    upload = _upload_file_from_bytes("resume.txt", b"plain text")

    with pytest.raises(ValueError, match="valid PDF"):
        await extract_text_from_pdf(upload)


@pytest.mark.asyncio
async def test_extract_text_from_oversized_pdf_raises_value_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Payload larger than configured limit should be rejected."""
    monkeypatch.setattr(settings, "max_file_size_mb", 0)
    upload = _upload_file_from_bytes("sample_cv.pdf", b"%PDF-1.4\noversized")

    with pytest.raises(ValueError, match="maximum size"):
        await extract_text_from_pdf(upload)
