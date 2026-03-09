"""Integration-style tests for the cover letter endpoint with mocked LLM provider."""

from __future__ import annotations

import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from app.main import app
from app.models.schemas import (
    CompanyResearchResult,
    CoverLetterResult,
    OptimizationResult,
)
from app.services.llm.base import LLMProvider


class _MockCoverLetterProvider(LLMProvider):
    """Mock provider that returns a valid cover letter result."""

    async def optimize(
        self,
        cv_text: str,
        job_description: str,
        company_name: str | None = None,
        company_context: object | None = None,
    ) -> OptimizationResult:
        _ = (cv_text, job_description, company_name, company_context)
        raise NotImplementedError

    async def synthesize_company(
        self,
        company_name: str,
        website_content: str,
        search_results: str,
        job_title: str | None = None,
    ) -> CompanyResearchResult:
        _ = (company_name, website_content, search_results, job_title)
        raise NotImplementedError

    async def generate_cover_letter(
        self,
        cv_text: str,
        job_description: str,
        company_name: str,
        hiring_manager: str | None,
        tone: str,
    ) -> CoverLetterResult:
        _ = (cv_text, job_description, company_name, hiring_manager, tone)
        return CoverLetterResult(
            greeting="Dear Hiring Manager,",
            opening_paragraph="I am excited to apply for this role.",
            body_paragraphs=[
                "With 5 years of backend experience...",
                "I have led teams and delivered...",
            ],
            closing_paragraph="I would welcome the opportunity to discuss.",
            sign_off="Sincerely, Jane Doe",
            key_selling_points=[
                "5 years backend experience",
                "Team leadership",
                "FastAPI and Python expertise",
            ],
            tone_used=tone,
            word_count=280,
        )


@pytest_asyncio.fixture
async def async_client() -> AsyncClient:
    """Provide AsyncClient configured against the in-process ASGI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.mark.asyncio
async def test_cover_letter_valid_request_returns_200(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Valid JSON request should return a typed cover letter payload."""

    def _mock_get_provider(provider_name: str | None = None) -> LLMProvider:
        return _MockCoverLetterProvider()

    monkeypatch.setattr("app.routers.cover_letter.get_provider", _mock_get_provider)

    response = await async_client.post(
        "/cover-letter",
        json={
            "cv_text": "Jane Doe, 5 years backend.",
            "job_description": "Senior Backend Engineer.",
            "company_name": "Acme Inc",
            "hiring_manager": None,
            "tone": "professional",
        },
        headers={"X-User-Id": "test-user"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["greeting"] == "Dear Hiring Manager,"
    assert payload["tone_used"] == "professional"
    assert payload["word_count"] == 280
    assert len(payload["body_paragraphs"]) == 2
    assert len(payload["key_selling_points"]) == 3


@pytest.mark.asyncio
async def test_cover_letter_missing_cv_text_returns_422(
    async_client: AsyncClient,
) -> None:
    """Missing cv_text field should fail request validation."""
    response = await async_client.post(
        "/cover-letter",
        json={
            "job_description": "Senior Backend Engineer.",
            "company_name": "Acme Inc",
            "tone": "professional",
        },
        headers={"X-User-Id": "test-user"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_cover_letter_invalid_tone_returns_422(async_client: AsyncClient) -> None:
    """Invalid tone value should fail request validation."""
    response = await async_client.post(
        "/cover-letter",
        json={
            "cv_text": "Jane Doe",
            "job_description": "Backend role.",
            "company_name": "Acme",
            "tone": "invalid_tone",
        },
        headers={"X-User-Id": "test-user"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_cover_letter_conversational_tone_returns_200(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Conversational tone should be accepted and reflected in response."""

    def _mock_get_provider(provider_name: str | None = None) -> LLMProvider:
        return _MockCoverLetterProvider()

    monkeypatch.setattr("app.routers.cover_letter.get_provider", _mock_get_provider)

    response = await async_client.post(
        "/cover-letter",
        json={
            "cv_text": "Jane Doe",
            "job_description": "Backend role.",
            "company_name": "Acme",
            "hiring_manager": None,
            "tone": "conversational",
        },
        headers={"X-User-Id": "test-user"},
    )
    assert response.status_code == 200
    assert response.json()["tone_used"] == "conversational"


@pytest.mark.asyncio
async def test_cover_letter_missing_job_description_returns_422(
    async_client: AsyncClient,
) -> None:
    """Missing job_description field should fail request validation."""
    response = await async_client.post(
        "/cover-letter",
        json={
            "cv_text": "Jane Doe",
            "company_name": "Acme",
            "tone": "professional",
        },
        headers={"X-User-Id": "test-user"},
    )
    assert response.status_code == 422


class _MockFailingCoverLetterProvider(LLMProvider):
    """Mock provider that raises on generate_cover_letter."""

    async def optimize(self, *args: object, **kwargs: object) -> OptimizationResult:
        raise NotImplementedError

    async def synthesize_company(
        self, *args: object, **kwargs: object
    ) -> CompanyResearchResult:
        raise NotImplementedError

    async def generate_cover_letter(
        self, *args: object, **kwargs: object
    ) -> CoverLetterResult:
        raise RuntimeError("LLM service unavailable")


@pytest.mark.asyncio
async def test_cover_letter_llm_error_returns_500(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """LLM provider error should map to HTTP 500."""

    def _mock_get_provider(provider_name: str | None = None) -> LLMProvider:
        return _MockFailingCoverLetterProvider()

    monkeypatch.setattr("app.routers.cover_letter.get_provider", _mock_get_provider)

    response = await async_client.post(
        "/cover-letter",
        json={
            "cv_text": "Jane Doe",
            "job_description": "Backend role.",
            "company_name": "Acme",
            "hiring_manager": None,
            "tone": "professional",
        },
        headers={"X-User-Id": "test-user"},
    )
    assert response.status_code == 500
