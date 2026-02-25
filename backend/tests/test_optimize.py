"""Integration-style tests for the optimize endpoint with mocked LLM provider."""

from __future__ import annotations

import os
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from app.main import app
from app.models.schemas import OptimizationResult
from app.services.llm.base import LLMProvider


class _MockSuccessProvider(LLMProvider):
    """Mock provider that returns a valid optimization result."""

    async def optimize(self, cv_text: str, job_description: str) -> OptimizationResult:
        """Return deterministic successful output for endpoint tests."""
        return OptimizationResult(
            sections=[
                {
                    "heading": "Experience",
                    "original": "Built APIs.",
                    "optimized": "Built resilient APIs aligned to role priorities.",
                    "changes_made": ["Added ATS-aligned keywords"],
                }
            ],
            gap_analysis=[
                {
                    "skill": "AWS",
                    "importance": "preferred",
                    "suggestion": "Add one cloud deployment bullet where applicable.",
                }
            ],
            keyword_matches=["Python", "FastAPI"],
            keyword_misses=["AWS"],
            match_score=85,
            summary="Strong backend fit with one notable cloud tooling gap.",
        )


class _MockInvalidJsonProvider(LLMProvider):
    """Mock provider that simulates parse failure from LLM output."""

    async def optimize(self, cv_text: str, job_description: str) -> OptimizationResult:
        """Raise ValueError to emulate invalid JSON returned by the LLM."""
        raise ValueError("LLM returned non-JSON output.")


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
async def test_optimize_valid_request_returns_200(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Valid multipart request should return a typed optimization payload."""

    async def _mock_extract_text_from_pdf(file: Any) -> str:
        return "Candidate CV text."

    monkeypatch.setattr(
        "app.routers.optimize.extract_text_from_pdf", _mock_extract_text_from_pdf
    )

    def _mock_get_provider(provider_name: str = "anthropic") -> LLMProvider:
        return _MockSuccessProvider()

    monkeypatch.setattr("app.routers.optimize.get_provider", _mock_get_provider)

    response = await async_client.post(
        "/optimize",
        data={"job_description": "Need FastAPI experience."},
        files={"cv_file": _dummy_pdf_file()},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["match_score"] == 85
    assert payload["keyword_matches"] == ["Python", "FastAPI"]


@pytest.mark.asyncio
async def test_optimize_missing_file_returns_422(async_client: AsyncClient) -> None:
    """Missing cv_file field should fail request validation."""
    response = await async_client.post(
        "/optimize",
        data={"job_description": "Need FastAPI experience."},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_optimize_missing_job_description_returns_422(
    async_client: AsyncClient,
) -> None:
    """Missing job_description field should fail request validation."""
    response = await async_client.post(
        "/optimize",
        files={"cv_file": _dummy_pdf_file()},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_optimize_invalid_llm_json_returns_500(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Provider parse errors should map to HTTP 500 for endpoint clients."""

    async def _mock_extract_text_from_pdf(file: Any) -> str:
        return "Candidate CV text."

    monkeypatch.setattr(
        "app.routers.optimize.extract_text_from_pdf", _mock_extract_text_from_pdf
    )

    def _mock_get_provider(provider_name: str = "anthropic") -> LLMProvider:
        return _MockInvalidJsonProvider()

    monkeypatch.setattr("app.routers.optimize.get_provider", _mock_get_provider)

    response = await async_client.post(
        "/optimize",
        data={"job_description": "Need FastAPI experience."},
        files={"cv_file": _dummy_pdf_file()},
    )

    assert response.status_code == 500
    assert "Failed to parse LLM response" in response.json()["detail"]
