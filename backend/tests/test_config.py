"""Unit tests for application config and settings validation."""

from __future__ import annotations

from app.core.config import Settings


class TestSettings:
    """Tests for Settings model."""

    def test_default_values_load_correctly(self) -> None:
        """Default values are set as expected when passed explicitly."""
        settings = Settings(
            anthropic_api_key="test",
            database_url="postgresql+asyncpg://localhost/test",
            cors_origins=["http://localhost:3000"],
        )
        assert settings.cors_origins == ["http://localhost:3000"]
        assert settings.max_file_size_mb == 5
        assert settings.llm_provider == "anthropic"
        assert settings.rate_limit_requests == 10

    def test_cors_origins_accepts_list(self) -> None:
        """CORS_ORIGINS accepts list format from pydantic."""
        settings = Settings(
            anthropic_api_key="test",
            database_url="postgresql+asyncpg://localhost/test",
            cors_origins=["http://localhost:3000", "https://app.example.com"],
        )
        assert "http://localhost:3000" in settings.cors_origins
        assert "https://app.example.com" in settings.cors_origins
