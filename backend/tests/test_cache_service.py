"""Unit tests for cache service and hash utilities."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.cache import CacheService
from app.services.cache.hash_utils import (
    hash_job_description,
    hash_text,
    hash_url,
    normalize_url,
)


class TestHashUtils:
    """Tests for hash_utils functions."""

    def test_hash_text_deterministic(self) -> None:
        """Same input produces same hash."""
        h1 = hash_text("hello")
        h2 = hash_text("hello")
        assert h1 == h2
        assert len(h1) == 64
        assert all(c in "0123456789abcdef" for c in h1)

    def test_hash_text_different_inputs_different_hashes(self) -> None:
        """Different inputs produce different hashes."""
        assert hash_text("a") != hash_text("b")

    def test_hash_url_normalizes_before_hashing(self) -> None:
        """hash_url uses normalize_url before hashing."""
        h1 = hash_url("https://example.com/")
        h2 = hash_url("https://EXAMPLE.COM")
        assert h1 == h2

    def test_hash_job_description_strips_whitespace(self) -> None:
        """hash_job_description strips leading/trailing whitespace."""
        h1 = hash_job_description("  Python developer  ")
        h2 = hash_job_description("Python developer")
        assert h1 == h2

    def test_normalize_url_lowercases_scheme_and_host(self) -> None:
        """URL normalization lowercases scheme and host."""
        assert normalize_url("HTTPS://EXAMPLE.COM") == "https://example.com/"

    def test_normalize_url_strips_www(self) -> None:
        """URL normalization strips www prefix."""
        assert "www." not in normalize_url("https://www.example.com/")


class TestCacheService:
    """Unit tests for CacheService with mocked database."""

    @pytest.mark.asyncio
    async def test_check_research_cache_miss_returns_none(self) -> None:
        """check_research_cache returns None when no match exists."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session = AsyncMock(spec=AsyncSession)
        mock_session.execute = AsyncMock(return_value=mock_result)

        service = CacheService(mock_session)
        result = await service.check_research_cache(
            user_id="user-1",
            company_url="https://example.com",
        )
        assert result is None

    @pytest.mark.asyncio
    async def test_check_optimization_cache_miss_returns_none(self) -> None:
        """check_optimization_cache returns None when no match exists."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session = AsyncMock(spec=AsyncSession)
        mock_session.execute = AsyncMock(return_value=mock_result)

        service = CacheService(mock_session)
        result = await service.check_optimization_cache(
            user_id="user-1",
            job_description="Need Python and FastAPI.",
            company_url=None,
        )
        assert result is None
