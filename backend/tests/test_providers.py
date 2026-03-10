"""Tests for provider availability and compare endpoints."""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.middleware.rate_limit import RateLimitMiddleware


@pytest_asyncio.fixture
async def async_client() -> AsyncClient:
    """Create async test client."""
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_get_providers_returns_available_and_default(
    async_client: AsyncClient,
) -> None:
    """GET /providers returns available list and default provider."""
    response = await async_client.get("/providers")
    assert response.status_code == 200
    data = response.json()
    assert "available" in data
    assert "default" in data
    assert isinstance(data["available"], list)
    assert data["default"] in ["anthropic", "openai", "gemini"]
    assert "anthropic" in data["available"]


@pytest.mark.asyncio
async def test_compare_requires_pdf(async_client: AsyncClient) -> None:
    """POST /compare rejects non-PDF upload."""
    response = await async_client.post(
        "/compare",
        data={"job_description": "JD", "providers": "anthropic,openai"},
        files={"cv_file": ("test.txt", b"not a pdf", "text/plain")},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_compare_requires_at_least_two_providers(
    async_client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """POST /compare requires at least 2 providers."""

    async def _mock_extract(_: object, locale: object = None) -> str:
        return "CV text"

    monkeypatch.setattr(
        "app.routers.providers.extract_text_from_pdf",
        _mock_extract,
    )
    # Bypass rate limiter so prior test requests don't cause 429
    monkeypatch.setattr(RateLimitMiddleware, "_LIMITED_PATHS", set())

    response = await async_client.post(
        "/compare",
        data={"job_description": "JD", "providers": "anthropic"},
        files={"cv_file": ("test.pdf", b"%PDF-1.4 dummy", "application/pdf")},
    )
    assert response.status_code == 400
    assert "At least 2 providers" in response.json().get("detail", "")
