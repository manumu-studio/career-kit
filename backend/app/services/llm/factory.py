"""Factory helpers for LLM providers."""

from typing import Optional

from app.core.config import get_settings
from app.services.llm.anthropic import AnthropicProvider
from app.services.llm.base import LLMProvider
from app.services.llm.gemini import GeminiProvider
from app.services.llm.openai import OpenAIProvider

PROVIDERS: dict[str, type[LLMProvider]] = {
    "anthropic": AnthropicProvider,
    "openai": OpenAIProvider,
    "gemini": GeminiProvider,
}


def get_provider(provider_name: Optional[str] = None) -> LLMProvider:  # noqa: UP007, UP045
    """Get an LLM provider instance by provider key."""
    settings = get_settings()
    name = provider_name or settings.llm_provider
    provider_class = PROVIDERS.get(name)
    if provider_class is None:
        available = ", ".join(sorted(PROVIDERS.keys()))
        raise ValueError(f"Unknown provider '{name}'. Available: {available}")
    return provider_class()


def get_available_providers() -> list[str]:
    """Return list of providers that have API keys configured."""
    settings = get_settings()
    available: list[str] = []
    if settings.anthropic_api_key:
        available.append("anthropic")
    if settings.openai_api_key:
        available.append("openai")
    if settings.gemini_api_key:
        available.append("gemini")
    return available
