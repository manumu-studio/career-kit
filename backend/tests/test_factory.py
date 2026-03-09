"""Unit tests for LLM factory (get_provider, get_available_providers)."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from app.services.llm.anthropic import AnthropicProvider
from app.services.llm.factory import get_available_providers, get_provider
from app.services.llm.gemini import GeminiProvider
from app.services.llm.openai import OpenAIProvider


class TestGetProvider:
    """Tests for get_provider function."""

    def test_get_provider_anthropic_returns_anthropic_provider(self) -> None:
        """get_provider('anthropic') returns AnthropicProvider instance."""
        provider = get_provider("anthropic")
        assert provider is not None
        assert isinstance(provider, AnthropicProvider)

    def test_get_provider_openai_returns_openai_provider(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """get_provider('openai') returns OpenAIProvider when key is set."""
        mock_settings = MagicMock()
        mock_settings.llm_provider = "anthropic"
        mock_settings.openai_api_key = "sk-test"
        monkeypatch.setattr(
            "app.services.llm.factory.get_settings",
            lambda: mock_settings,
        )
        provider = get_provider("openai")
        assert provider is not None
        assert isinstance(provider, OpenAIProvider)

    def test_get_provider_gemini_returns_gemini_provider(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """get_provider('gemini') returns GeminiProvider when key is set."""
        mock_settings = MagicMock()
        mock_settings.gemini_api_key = "gemini-test-key"
        monkeypatch.setattr(
            "app.services.llm.gemini.get_settings",
            lambda: mock_settings,
        )
        provider = get_provider("gemini")
        assert provider is not None
        assert isinstance(provider, GeminiProvider)

    def test_get_provider_unknown_raises_value_error(self) -> None:
        """get_provider('unknown') raises ValueError."""
        with pytest.raises(ValueError, match="Unknown provider"):
            get_provider("unknown")


class TestGetAvailableProviders:
    """Tests for get_available_providers function."""

    def test_get_available_providers_includes_anthropic_when_configured(
        self,
    ) -> None:
        """Returns anthropic when ANTHROPIC_API_KEY is set (from conftest/env)."""
        available = get_available_providers()
        assert "anthropic" in available
