"""Search aggregation with Tavily primary provider and DuckDuckGo fallback."""

from __future__ import annotations

import asyncio
import importlib
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from types import ModuleType
from typing import Optional

from app.models.schemas import SearchAggregatorResult, SearchResult

logger = logging.getLogger(__name__)


class SearchProviderError(Exception):
    """Raised when a search provider call fails."""


class SearchProvider(ABC):
    """Abstract search provider interface."""

    @abstractmethod
    async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
        """Execute query and return normalized search results."""


class TavilySearchProvider(SearchProvider):
    """Primary search provider backed by Tavily API."""

    def __init__(self, api_key: str) -> None:
        self._api_key = api_key

    async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
        """Search Tavily and map results to internal schema."""
        try:
            tavily_module: ModuleType = importlib.import_module("tavily")
            client = tavily_module.TavilyClient(api_key=self._api_key)
            response = await asyncio.to_thread(
                client.search,
                query=query,
                max_results=max_results,
                search_depth="advanced",
                include_raw_content=True,
            )
            raw_results = response.get("results", [])
            return [
                SearchResult(
                    title=str(result.get("title", "")),
                    content=str(
                        result.get("raw_content") or result.get("content") or ""
                    ),
                    url=str(result.get("url", "")),
                    relevance_score=self._coerce_score(result.get("score")),
                    query_used=query,
                )
                for result in raw_results
            ]
        except Exception as exc:
            raise SearchProviderError("Tavily search failed.") from exc

    @staticmethod
    def _coerce_score(value: object) -> Optional[float]:  # noqa: UP045
        """Convert arbitrary score field to float when possible."""
        if isinstance(value, (float, int)):
            return float(value)
        return None


class DuckDuckGoSearchProvider(SearchProvider):
    """Fallback search provider backed by DuckDuckGo snippets."""

    async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
        """Search DuckDuckGo in a worker thread and normalize snippets."""
        try:
            ddgs_module: ModuleType = importlib.import_module("ddgs")
            ddgs_class = ddgs_module.DDGS

            def _run_search() -> list[dict[str, object]]:
                # verify=False: Xcode Python 3.9 SSL lacks TLS 1.3 support
                return list(ddgs_class(verify=False).text(query, max_results=max_results))

            raw_results = await asyncio.to_thread(_run_search)
            mapped = [
                SearchResult(
                    title=str(result.get("title", "")),
                    content=str(result.get("body", "")),
                    url=str(result.get("href", "")),
                    relevance_score=None,
                    query_used=query,
                )
                for result in raw_results
            ]
            await asyncio.sleep(1.0)
            return mapped
        except Exception as exc:
            raise SearchProviderError("DuckDuckGo search failed.") from exc


class SearchAggregator:
    """Runs company research queries with automatic provider fallback."""

    QUERY_TEMPLATES: list[str] = [
        "{company} glassdoor reviews culture work environment",
        "{company} reddit employee experience what is it like",
        "{company} interview questions process tips",
        "{company} recent news developments {year}",
        "{company} employee reviews pros cons",
    ]
    TECH_QUERY = "{company} tech stack engineering blog"
    MAX_RESULTS: int = 10

    def __init__(self, tavily_api_key: Optional[str] = None) -> None:  # noqa: UP045
        if tavily_api_key:
            self.primary_provider: SearchProvider = TavilySearchProvider(tavily_api_key)
            self.primary_provider_name = "tavily"
        else:
            self.primary_provider = DuckDuckGoSearchProvider()
            self.primary_provider_name = "duckduckgo"
        self.fallback_provider: SearchProvider = DuckDuckGoSearchProvider()

    async def search(
        self,
        company_name: str,
        job_title: Optional[str] = None,  # noqa: UP045
        max_results_per_query: int = 5,
    ) -> SearchAggregatorResult:
        """Run queries across providers and return deduplicated aggregate results."""
        queries = self._build_queries(company_name, job_title)
        provider = self.primary_provider
        provider_name = self.primary_provider_name
        all_results: list[SearchResult] = []

        for query in queries:
            try:
                all_results.extend(await provider.search(query, max_results_per_query))
            except SearchProviderError:
                logger.warning(
                    "Primary search provider failed for query: %s", query, exc_info=True
                )
                if provider_name == "tavily":
                    provider = self.fallback_provider
                    provider_name = "duckduckgo"
                    try:
                        all_results.extend(
                            await provider.search(query, max_results_per_query)
                        )
                    except SearchProviderError:
                        logger.warning(
                            "Fallback search provider failed for query: %s",
                            query,
                            exc_info=True,
                        )
                        continue
                else:
                    continue

        deduped = self._deduplicate(all_results)
        deduped = deduped[: self.MAX_RESULTS]
        return SearchAggregatorResult(
            results=deduped,
            provider_used=provider_name,
            queries_run=len(queries),
            total_results=len(deduped),
        )

    def _build_queries(
        self,
        company_name: str,
        job_title: Optional[str] = None,  # noqa: UP045
    ) -> list[str]:
        """Build standard and optional tech-role queries."""
        current_year = datetime.utcnow().year
        queries = [
            template.format(company=company_name, year=current_year)
            for template in self.QUERY_TEMPLATES
        ]
        if self._is_tech_role(job_title):
            queries.append(self.TECH_QUERY.format(company=company_name))
        return queries[:6]

    def _is_tech_role(self, job_title: Optional[str]) -> bool:  # noqa: UP045
        """Return True when job title suggests technical role."""
        if not job_title:
            return False
        lowered = job_title.lower()
        tech_keywords = (
            "engineer",
            "developer",
            "devops",
            "software",
            "data",
            "platform",
            "sre",
        )
        return any(keyword in lowered for keyword in tech_keywords)

    def _deduplicate(self, results: list[SearchResult]) -> list[SearchResult]:
        """Deduplicate search results by normalized URL, keeping first seen."""
        deduped: list[SearchResult] = []
        seen_urls: set[str] = set()
        for result in results:
            url = result.url.strip().lower()
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            deduped.append(result)
        return deduped
