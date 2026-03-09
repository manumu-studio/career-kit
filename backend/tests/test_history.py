"""Integration tests for history router endpoints."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.database import get_db_optional


async def _mock_get_db_none() -> AsyncGenerator[AsyncSession | None, None]:
    """Yield None to simulate no database available."""
    yield None


@pytest_asyncio.fixture
async def async_client_no_db() -> AsyncGenerator[AsyncClient, None]:
    """Client with get_db_optional overridden to yield None."""
    app.dependency_overrides[get_db_optional] = _mock_get_db_none
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://testserver",
        headers={"X-User-Id": "test-user"},
    ) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_list_history_empty_when_no_db(
    async_client_no_db: AsyncClient,
) -> None:
    """GET /history returns empty list when database is unavailable."""
    response = await async_client_no_db.get("/history")
    assert response.status_code == 200
    payload = response.json()
    assert payload["items"] == []
    assert payload["total"] == 0
    assert payload["page"] == 1
    assert payload["limit"] == 20


@pytest.mark.asyncio
async def test_get_history_stats_when_no_db(
    async_client_no_db: AsyncClient,
) -> None:
    """GET /history/stats returns zeros when database is unavailable."""
    response = await async_client_no_db.get("/history/stats")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total_analyses"] == 0
    assert payload["cache_hits"] == 0
    assert payload["total_cost_usd"] == 0.0


@pytest.mark.asyncio
async def test_get_history_detail_404_when_no_db(
    async_client_no_db: AsyncClient,
) -> None:
    """GET /history/{id} returns 404 when database is unavailable."""
    fake_id = str(uuid4())
    response = await async_client_no_db.get(f"/history/{fake_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Analysis not found."


@pytest.mark.asyncio
async def test_delete_history_entry_404_when_no_db(
    async_client_no_db: AsyncClient,
) -> None:
    """DELETE /history/{id} returns 404 when database is unavailable."""
    fake_id = str(uuid4())
    response = await async_client_no_db.delete(f"/history/{fake_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_clear_all_history_204_when_no_db(
    async_client_no_db: AsyncClient,
) -> None:
    """DELETE /history returns 204 when database is unavailable."""
    response = await async_client_no_db.delete("/history")
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_check_research_cache_returns_cached_false_when_no_db(
    async_client_no_db: AsyncClient,
) -> None:
    """POST /history/check-research returns cached=False when no DB."""
    response = await async_client_no_db.post(
        "/history/check-research",
        json={"company_url": "https://example.com"},
    )
    assert response.status_code == 200
    assert response.json()["cached"] is False


@pytest.mark.asyncio
async def test_check_optimization_cache_returns_cached_false_when_no_db(
    async_client_no_db: AsyncClient,
) -> None:
    """POST /history/check-optimization returns cached=False when no DB."""
    response = await async_client_no_db.post(
        "/history/check-optimization",
        json={"job_description": "Need Python.", "company_url": None},
    )
    assert response.status_code == 200
    assert response.json()["cached"] is False
