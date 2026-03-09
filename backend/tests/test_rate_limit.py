"""Tests for in-memory /optimize rate limiting middleware behavior."""

from __future__ import annotations

import os
from collections.abc import AsyncIterator
from typing import Optional

import pytest
import pytest_asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from app.middleware.rate_limit import RateLimitMiddleware
from app.models.schemas import CompanyResearchResult, OptimizationResult
from app.routers.optimize import router as optimize_router


class _Clock:
    """Mutable monotonic clock for deterministic window-expiry tests."""

    def __init__(self, now: float = 0.0) -> None:
        self._now = now

    def now(self) -> float:
        """Return the current mocked timestamp."""
        return self._now

    def advance(self, seconds: float) -> None:
        """Move the mocked clock forward by the given seconds."""
        self._now += seconds


@pytest.fixture
def rate_limit_requests() -> int:
    """Use a low request count to keep tests fast."""
    return 3


@pytest.fixture
def rate_limit_window_seconds() -> int:
    """Use a short window so reset behavior is easy to verify."""
    return 2


@pytest.fixture
def test_clock() -> _Clock:
    """Provide a deterministic monotonic clock for middleware timing."""
    return _Clock()


@pytest.fixture
def test_app(
    rate_limit_requests: int,
    rate_limit_window_seconds: int,
    test_clock: _Clock,
) -> FastAPI:
    """Build an app instance with rate limiting applied to /optimize."""
    app = FastAPI(title="Rate Limit Test App")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(
        RateLimitMiddleware,
        rate_limit_requests=rate_limit_requests,
        rate_limit_window_seconds=rate_limit_window_seconds,
        time_provider=test_clock.now,
    )
    app.include_router(optimize_router)

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


@pytest_asyncio.fixture
async def async_client(test_app: FastAPI) -> AsyncIterator[AsyncClient]:
    """Expose an AsyncClient bound to the in-process ASGI test app."""
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


def _dummy_pdf_file() -> tuple[str, bytes, str]:
    """Return a minimally valid multipart file tuple."""
    return ("sample_cv.pdf", b"%PDF-1.4\ndummy", "application/pdf")


@pytest.fixture(autouse=True)
def mock_optimize_dependencies(monkeypatch: pytest.MonkeyPatch) -> None:
    """Mock parser/provider dependencies so tests avoid external API calls."""

    async def _mock_extract_text_from_pdf(_: object) -> str:
        return "Candidate CV text."

    class _MockProvider:
        model_name = "mock-model"

        async def optimize(
            self,
            cv_text: str,  # noqa: ARG002
            job_description: str,  # noqa: ARG002
            company_name: Optional[str] = None,  # noqa: ARG002, UP045
            company_context: object | None = None,  # noqa: ARG002
        ) -> OptimizationResult:
            _ = (company_name, company_context)
            return OptimizationResult(
                sections=[
                    {
                        "heading": "Experience",
                        "original": "Built APIs.",
                        "optimized": "Built resilient APIs aligned to role priorities.",
                        "changes_made": ["Added job-aligned keywords"],
                    }
                ],
                gap_analysis=[
                    {
                        "skill": "AWS",
                        "importance": "preferred",
                        "suggestion": (
                            "Add one cloud deployment bullet where applicable."
                        ),
                    }
                ],
                keyword_matches=["Python", "FastAPI"],
                keyword_misses=["AWS"],
                match_score=85,
                summary="Strong backend fit with one notable cloud tooling gap.",
            )

        async def synthesize_company(
            self,
            company_name: str,
            website_content: str,
            search_results: str,
            job_title: Optional[str] = None,  # noqa: UP045
        ) -> CompanyResearchResult:
            _ = (company_name, website_content, search_results, job_title)
            raise NotImplementedError

    def _mock_get_provider(provider_name: str = "anthropic") -> _MockProvider:  # noqa: ARG001
        return _MockProvider()

    monkeypatch.setattr(
        "app.routers.optimize.extract_text_from_pdf", _mock_extract_text_from_pdf
    )
    monkeypatch.setattr("app.routers.optimize.get_provider", _mock_get_provider)


@pytest.mark.asyncio
async def test_under_limit(async_client: AsyncClient) -> None:
    """Requests below limit should all succeed."""
    for _ in range(2):
        response = await async_client.post(
            "/optimize",
            data={"job_description": "Need FastAPI experience."},
            files={"cv_file": _dummy_pdf_file()},
        )
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_at_limit(
    async_client: AsyncClient,
    rate_limit_requests: int,
) -> None:
    """The request exactly at configured limit should still succeed."""
    last_status_code = 0
    for _ in range(rate_limit_requests):
        response = await async_client.post(
            "/optimize",
            data={"job_description": "Need FastAPI experience."},
            files={"cv_file": _dummy_pdf_file()},
        )
        last_status_code = response.status_code
    assert last_status_code == 200


@pytest.mark.asyncio
async def test_over_limit(
    async_client: AsyncClient,
    rate_limit_requests: int,
) -> None:
    """The first request above the configured limit should be rejected."""
    for _ in range(rate_limit_requests):
        response = await async_client.post(
            "/optimize",
            data={"job_description": "Need FastAPI experience."},
            files={"cv_file": _dummy_pdf_file()},
        )
        assert response.status_code == 200

    over_limit_response = await async_client.post(
        "/optimize",
        data={"job_description": "Need FastAPI experience."},
        files={"cv_file": _dummy_pdf_file()},
    )
    assert over_limit_response.status_code == 429


@pytest.mark.asyncio
async def test_429_response_format(
    async_client: AsyncClient,
    rate_limit_requests: int,
) -> None:
    """429 response must include detail message and Retry-After header."""
    for _ in range(rate_limit_requests):
        await async_client.post(
            "/optimize",
            data={"job_description": "Need FastAPI experience."},
            files={"cv_file": _dummy_pdf_file()},
        )

    response = await async_client.post(
        "/optimize",
        data={"job_description": "Need FastAPI experience."},
        files={"cv_file": _dummy_pdf_file()},
    )
    assert response.status_code == 429
    assert "detail" in response.json()
    assert response.headers.get("Retry-After") is not None


@pytest.mark.asyncio
async def test_health_not_limited(async_client: AsyncClient) -> None:
    """Health endpoint should never be throttled by optimize middleware."""
    for _ in range(10):
        response = await async_client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_options_requests_bypass_rate_limit(async_client: AsyncClient) -> None:
    """Preflight OPTIONS requests should pass through without rate limiting."""
    statuses: list[int] = []
    for _ in range(10):
        response = await async_client.options(
            "/optimize",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )
        statuses.append(response.status_code)
    assert all(status != 429 for status in statuses)
    assert any(status == 200 for status in statuses)


@pytest.mark.asyncio
async def test_window_reset(
    async_client: AsyncClient,
    rate_limit_requests: int,
    rate_limit_window_seconds: int,
    test_clock: _Clock,
) -> None:
    """After window expiry, the same client IP should be allowed again."""
    for _ in range(rate_limit_requests):
        response = await async_client.post(
            "/optimize",
            data={"job_description": "Need FastAPI experience."},
            files={"cv_file": _dummy_pdf_file()},
        )
        assert response.status_code == 200

    throttled_response = await async_client.post(
        "/optimize",
        data={"job_description": "Need FastAPI experience."},
        files={"cv_file": _dummy_pdf_file()},
    )
    assert throttled_response.status_code == 429

    test_clock.advance(rate_limit_window_seconds + 0.1)

    recovered_response = await async_client.post(
        "/optimize",
        data={"job_description": "Need FastAPI experience."},
        files={"cv_file": _dummy_pdf_file()},
    )
    assert recovered_response.status_code == 200
