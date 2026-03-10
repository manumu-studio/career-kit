"""Tests for i18n: normalize_locale, get_error_message, and Spanish error paths."""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.i18n import get_error_message, normalize_locale
from app.main import app
from app.models.schemas import OptimizationResult
from app.services.llm.base import LLMProvider


def test_normalize_locale_accepts_en() -> None:
    """normalize_locale should return 'en' for 'en' or None."""
    assert normalize_locale("en") == "en"
    assert normalize_locale(None) == "en"
    assert normalize_locale("") == "en"


def test_normalize_locale_accepts_es() -> None:
    """normalize_locale should return 'es' for 'es'."""
    assert normalize_locale("es") == "es"


def test_normalize_locale_defaults_invalid_to_en() -> None:
    """normalize_locale should default invalid values to 'en'."""
    assert normalize_locale("fr") == "en"
    assert normalize_locale("de") == "en"
    assert normalize_locale("invalid") == "en"


def test_get_error_message_returns_english() -> None:
    """get_error_message should return English for locale 'en'."""
    msg = get_error_message("en", "invalid_pdf")
    assert "PDF" in msg
    assert "archivo" not in msg


def test_get_error_message_returns_spanish() -> None:
    """get_error_message should return Spanish for locale 'es'."""
    msg = get_error_message("es", "invalid_pdf")
    assert "archivo" in msg or "PDF" in msg
    assert "must be" not in msg


def test_get_error_message_fallback_for_unknown_key() -> None:
    """get_error_message should return key if missing in both locales."""
    msg = get_error_message("en", "unknown_key_xyz")
    assert msg == "unknown_key_xyz"


def test_get_error_message_format_kwargs() -> None:
    """get_error_message should format template with kwargs."""
    msg = get_error_message("en", "unknown_provider", name="foo", available="a,b")
    assert "foo" in msg
    assert "a,b" in msg


@pytest_asyncio.fixture
async def async_client() -> AsyncClient:
    """Provide AsyncClient configured against the in-process ASGI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


def _dummy_pdf_file() -> tuple[str, bytes, str]:
    """Return a minimally valid file tuple for multipart upload."""
    return ("sample_cv.pdf", b"%PDF-1.4\ndummy", "application/pdf")


@pytest.mark.asyncio
async def test_optimize_invalid_pdf_returns_spanish_error_when_language_es(
    async_client: AsyncClient,
) -> None:
    """When language=es and PDF is invalid, error message should be in Spanish."""
    response = await async_client.post(
        "/optimize",
        data={"job_description": "Need Python.", "language": "es"},
        files={"cv_file": ("not_a_pdf.txt", b"plain text", "text/plain")},
    )
    assert response.status_code == 400
    detail = response.json().get("detail", "")
    assert "archivo" in detail or "PDF" in detail
    assert "must be" not in detail


@pytest.mark.asyncio
async def test_optimize_invalid_language_returns_422(async_client: AsyncClient) -> None:
    """When language is not 'en' or 'es', request should return 422."""
    response = await async_client.post(
        "/optimize",
        data={"job_description": "Need Python.", "language": "fr"},
        files={"cv_file": _dummy_pdf_file()},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_optimize_language_es_passed_to_provider(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """When language=es, the provider should receive 'es' for LLM prompts."""
    received_language: list[str] = []

    class _CaptureLanguageProvider(LLMProvider):
        async def optimize(
            self,
            cv_text: str,
            job_description: str,
            company_name=None,
            company_context=None,
            language: str = "en",
        ) -> OptimizationResult:
            received_language.append(language)
            return OptimizationResult(
                sections=[],
                gap_analysis=[],
                keyword_matches=[],
                keyword_misses=[],
                match_score=80,
                summary="Test",
            )

        async def synthesize_company(self, *args, **kwargs):
            raise NotImplementedError

        async def generate_cover_letter(self, *args, **kwargs):
            raise NotImplementedError

    async def _mock_extract(file, locale=None) -> str:
        return "CV text."

    monkeypatch.setattr("app.routers.optimize.extract_text_from_pdf", _mock_extract)
    monkeypatch.setattr(
        "app.routers.optimize.get_provider",
        lambda _: _CaptureLanguageProvider(),
    )

    response = await async_client.post(
        "/optimize",
        data={
            "job_description": "Need Python.",
            "language": "es",
            "force_refresh": "true",
        },
        files={"cv_file": _dummy_pdf_file()},
    )
    assert response.status_code == 200
    assert received_language == ["es"]
