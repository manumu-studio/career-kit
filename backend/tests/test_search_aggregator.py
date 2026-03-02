"""Unit tests for SearchAggregator and providers.

Validates query generation, fallback behavior, and result capping.
"""

from __future__ import annotations

import os
from datetime import datetime

import pytest

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from app.models.schemas import SearchResult
from app.services.research.search_aggregator import (
    DuckDuckGoSearchProvider,
    SearchAggregator,
    SearchProvider,
    SearchProviderError,
    TavilySearchProvider,
)


class _MockTavilyClient:
    """Mock Tavily client returning deterministic result payloads."""

    def __init__(
        self,
        api_key: str,
        should_raise: bool = False,
        result_count: int = 5,
    ) -> None:
        self.api_key = api_key
        self._should_raise = should_raise
        self._result_count = result_count

    def search(self, **kwargs: object) -> dict[str, list[dict[str, object]]]:
        """Return synthetic Tavily search response structure."""
        if self._should_raise:
            raise RuntimeError("tavily failure")
        max_results = int(kwargs.get("max_results", self._result_count))
        return {
            "results": [
                {
                    "title": f"Result {i}",
                    "content": f"Content {i}",
                    "url": f"https://example.com/{i}",
                    "score": 0.9,
                }
                for i in range(max_results)
            ]
        }


class _MockDDGS:
    """Mock DuckDuckGo search class used by fallback provider."""

    def __init__(self, result_count: int = 5) -> None:
        self._result_count = result_count

    def text(self, query: str, max_results: int = 5) -> list[dict[str, str]]:
        """Return deterministic DDG result dictionaries."""
        _ = query
        size = min(max_results, self._result_count)
        return [
            {
                "title": f"DDG {i}",
                "body": f"Snippet {i}",
                "href": f"https://ddg.example.com/{i}",
            }
            for i in range(size)
        ]


@pytest.fixture
def patch_import_module_success(monkeypatch: pytest.MonkeyPatch) -> None:
    """Patch dynamic imports to return mock Tavily and DDG modules."""

    class _TavilyModule:
        TavilyClient = _MockTavilyClient

    class _DDGModule:
        DDGS = _MockDDGS

    def _import_module(name: str) -> object:
        if name == "tavily":
            return _TavilyModule
        if name == "ddgs":
            return _DDGModule
        raise ModuleNotFoundError(name)

    monkeypatch.setattr(
        "app.services.research.search_aggregator.importlib.import_module",
        _import_module,
    )


@pytest.mark.asyncio
async def test_tavily_provider_search(
    patch_import_module_success: None,
) -> None:
    """Tavily provider should map module response to SearchResult models."""
    _ = patch_import_module_success
    provider = TavilySearchProvider(api_key="test-key")
    results = await provider.search("acme query", max_results=3)

    assert len(results) == 3
    assert isinstance(results[0], SearchResult)
    assert results[0].relevance_score is not None
    assert isinstance(results[0].relevance_score, float)


@pytest.mark.asyncio
async def test_ddg_provider_search(
    patch_import_module_success: None,
) -> None:
    """DDG provider should map snippets and leave relevance_score unset."""
    _ = patch_import_module_success
    provider = DuckDuckGoSearchProvider()
    results = await provider.search("acme query", max_results=3)

    assert len(results) == 3
    assert isinstance(results[0], SearchResult)
    assert results[0].relevance_score is None


def test_aggregator_uses_tavily_when_key_present() -> None:
    """Aggregator should choose Tavily as primary when key is provided."""
    aggregator = SearchAggregator(tavily_api_key="test-key")
    assert aggregator.primary_provider_name == "tavily"


def test_aggregator_uses_ddg_when_no_key() -> None:
    """Aggregator should default to DDG when key is missing."""
    aggregator = SearchAggregator(tavily_api_key=None)
    assert aggregator.primary_provider_name == "duckduckgo"


@pytest.mark.asyncio
async def test_aggregator_fallback_on_tavily_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Aggregator should switch to fallback provider when Tavily fails."""

    class _BrokenTavily(SearchProvider):
        async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
            _ = (query, max_results)
            raise SearchProviderError("primary failed")

    class _HealthyDDG(SearchProvider):
        async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
            return [
                SearchResult(
                    title=f"DDG {i}",
                    content=f"Snippet {i}",
                    url=f"https://ddg.example.com/{query}/{i}",
                    relevance_score=None,
                    query_used=query,
                )
                for i in range(max_results)
            ]

    aggregator = SearchAggregator(tavily_api_key="test-key")
    aggregator.primary_provider = _BrokenTavily()
    aggregator.primary_provider_name = "tavily"
    aggregator.fallback_provider = _HealthyDDG()

    warned_messages: list[str] = []

    def _capture_warning(message: str, *args: object, **kwargs: object) -> None:
        _ = (args, kwargs)
        warned_messages.append(message)

    monkeypatch.setattr(
        "app.services.research.search_aggregator.logger.warning",
        _capture_warning,
    )

    result = await aggregator.search("Acme Corp", "Engineer")

    assert result.provider_used == "duckduckgo"
    assert len(result.results) > 0
    assert any("Primary search provider failed" in msg for msg in warned_messages)


def test_query_generation() -> None:
    """Standard query generation should build five company-focused queries."""
    aggregator = SearchAggregator(tavily_api_key=None)
    queries = aggregator._build_queries("Acme Corp", None)

    assert len(queries) == 5
    assert all("Acme Corp" in query for query in queries)
    assert str(datetime.utcnow().year) in queries[3]


def test_tech_query_added_for_tech_role() -> None:
    """Tech job titles should add the sixth engineering-focused query."""
    aggregator = SearchAggregator(tavily_api_key=None)
    queries = aggregator._build_queries("Acme Corp", "Senior Software Engineer")

    assert len(queries) == 6
    assert "tech stack" in queries[-1]


def test_no_tech_query_for_non_tech_role() -> None:
    """Non-technical roles should keep only the base five templates."""
    aggregator = SearchAggregator(tavily_api_key=None)
    queries = aggregator._build_queries("Acme Corp", "Marketing Manager")

    assert len(queries) == 5


def test_deduplication() -> None:
    """Deduplication should keep first occurrence and remove duplicate URLs."""
    aggregator = SearchAggregator(tavily_api_key=None)
    results = [
        SearchResult(
            title=f"Title {i}",
            content=f"Content {i}",
            url=f"https://example.com/{0 if i in {3, 4, 5, 6} else i}",
            relevance_score=None,
            query_used="q",
        )
        for i in range(10)
    ]

    deduped = aggregator._deduplicate(results)

    assert len(deduped) == 6
    assert deduped[0].url == "https://example.com/0"
    assert deduped[1].url == "https://example.com/1"


@pytest.mark.asyncio
async def test_results_capped_at_max() -> None:
    """Aggregator output should enforce the 10-result budget cap."""

    class _ManyResultsProvider(SearchProvider):
        async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
            _ = max_results
            return [
                SearchResult(
                    title=f"{query}-{i}",
                    content=f"Content {i}",
                    url=f"https://many.example.com/{query.replace(' ', '-')}/{i}",
                    relevance_score=0.5,
                    query_used=query,
                )
                for i in range(6)
            ]

    aggregator = SearchAggregator(tavily_api_key=None)
    aggregator.primary_provider = _ManyResultsProvider()
    aggregator.primary_provider_name = "duckduckgo"
    aggregator.fallback_provider = _ManyResultsProvider()

    result = await aggregator.search("Acme Corp", "Engineer")

    assert result.total_results <= 10
    assert len(result.results) <= 10
    assert aggregator.MAX_RESULTS == 10
