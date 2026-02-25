"""Factory helpers for LLM providers."""

from app.services.llm.anthropic import AnthropicProvider
from app.services.llm.base import LLMProvider

_providers: dict[str, type[LLMProvider]] = {
    "anthropic": AnthropicProvider,
}


def get_provider(provider_name: str = "anthropic") -> LLMProvider:
    """Get an LLM provider instance by provider key."""
    provider_class = _providers.get(provider_name)
    if provider_class is None:
        available = ", ".join(sorted(_providers.keys()))
        raise ValueError(f"Unknown provider '{provider_name}'. Available: {available}")
    return provider_class()
