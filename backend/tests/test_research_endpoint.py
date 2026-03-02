"""Integration tests for POST /research-company endpoint with mocked services."""

from __future__ import annotations

import os
from typing import Optional

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from app.main import app
from app.middleware.rate_limit import RateLimitMiddleware
from app.models.schemas import (
    CompanyProfile,
    CompanyReport,
    CompanyResearchResult,
    EmployeeSentiment,
    OptimizationResult,
    SearchAggregatorResult,
    SearchResult,
    WebsiteContent,
)
from app.services.llm.base import LLMProvider


class _MockSynthesisProvider(LLMProvider):
    """Mock provider that returns deterministic company research output."""

    async def optimize(
        self,
        cv_text: str,
        job_description: str,
        company_name: Optional[str] = None,  # noqa: UP045
        company_context: Optional[CompanyProfile] = None,  # noqa: UP045
    ) -> OptimizationResult:
        _ = (cv_text, job_description, company_name, company_context)
        raise NotImplementedError

    async def synthesize_company(
        self,
        company_name: str,
        website_content: str,
        search_results: str,
        job_title: Optional[str] = None,  # noqa: UP045
    ) -> CompanyResearchResult:
        _ = (website_content, search_results, job_title)
        return CompanyResearchResult(
            profile=CompanyProfile(
                name=company_name,
                industry="Technology",
                size_estimate="1000-5000",
                core_values=["Innovation"],
                culture_keywords=["fast-paced"],
                tech_stack=["Python"],
                recent_news=[],
                interview_insights=[],
                employee_sentiment=EmployeeSentiment(
                    overall="positive",
                    pros=["Good culture"],
                    cons=["Long hours"],
                    summary="Mostly positive.",
                ),
                benefits_highlights=[],
                leadership_names=[],
            ),
            report=CompanyReport(
                executive_summary="A solid tech company.",
                culture_and_values="Innovation-driven.",
                what_they_look_for="Strong engineers.",
                interview_preparation="Expect system design.",
                recent_developments="Series B funding.",
                red_flags=[],
                talking_points=["Mention scalability"],
                keywords_to_mirror=["innovation", "scalability"],
            ),
            sources_used=["https://acme.com/about"],
            research_quality="high",
            researched_at="2026-01-01T00:00:00+00:00",
        )


class _FailingSynthesisProvider(LLMProvider):
    """Mock provider that fails synthesis to validate error handling."""

    async def optimize(
        self,
        cv_text: str,
        job_description: str,
        company_name: Optional[str] = None,  # noqa: UP045
        company_context: Optional[CompanyProfile] = None,  # noqa: UP045
    ) -> OptimizationResult:
        _ = (cv_text, job_description, company_name, company_context)
        raise NotImplementedError

    async def synthesize_company(
        self,
        company_name: str,
        website_content: str,
        search_results: str,
        job_title: Optional[str] = None,  # noqa: UP045
    ) -> CompanyResearchResult:
        _ = (company_name, website_content, search_results, job_title)
        raise ValueError("synthetic LLM failure")


def _make_search_results(count: int) -> list[SearchResult]:
    """Build deterministic search results for endpoint mocks."""
    return [
        SearchResult(
            title=f"Result {i}",
            content=f"Content {i}",
            url=f"https://example.com/{i}",
            relevance_score=0.8,
            query_used="query",
        )
        for i in range(count)
    ]


def _make_search_response(count: int = 3) -> SearchAggregatorResult:
    """Build deterministic aggregate search response payload."""
    results = _make_search_results(count)
    return SearchAggregatorResult(
        results=results,
        provider_used="duckduckgo",
        queries_run=5,
        total_results=len(results),
    )


def _get_rate_limit_middleware() -> RateLimitMiddleware | None:
    """Return active rate-limit middleware instance from app stack."""
    stack = app.middleware_stack or app.build_middleware_stack()
    current = stack
    while hasattr(current, "app"):
        if isinstance(current, RateLimitMiddleware):
            return current
        current = current.app
    if isinstance(current, RateLimitMiddleware):
        return current
    return None


@pytest.fixture(autouse=True)
def reset_rate_limit_state() -> None:
    """Clear in-memory rate-limit counters before each test for isolation."""
    middleware = _get_rate_limit_middleware()
    if middleware is not None:
        middleware._requests_by_ip.clear()  # noqa: SLF001


@pytest_asyncio.fixture
async def async_client() -> AsyncClient:
    """Provide AsyncClient configured against the in-process ASGI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.mark.asyncio
async def test_research_company_success(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Successful research request should return full structured payload."""

    class _MockWebsiteScraper:
        async def scrape(self, base_url: str) -> WebsiteContent:
            _ = base_url
            return WebsiteContent(about="Great company", raw_text_length=100)

    class _MockSearchAggregator:
        def __init__(self, tavily_api_key: Optional[str] = None) -> None:  # noqa: UP045
            _ = tavily_api_key

        async def search(
            self,
            company_name: str,
            job_title: Optional[str] = None,  # noqa: UP045
        ) -> SearchAggregatorResult:
            _ = (company_name, job_title)
            return _make_search_response(3)

    monkeypatch.setattr("app.routers.research.WebsiteScraper", _MockWebsiteScraper)
    monkeypatch.setattr("app.routers.research.SearchAggregator", _MockSearchAggregator)
    monkeypatch.setattr(
        "app.routers.research.get_provider",
        lambda _: _MockSynthesisProvider(),
    )

    response = await async_client.post(
        "/research-company",
        json={
            "company_name": "Acme Corp",
            "company_url": "https://acme.com",
            "job_title": "Engineer",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["profile"]["name"] == "Acme Corp"
    assert "report" in payload
    assert "sources_used" in payload
    assert "research_quality" in payload
    assert "researched_at" in payload


@pytest.mark.asyncio
async def test_research_company_no_url(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Request without company URL should skip scraper and still succeed."""
    scraper_called = False

    class _MockWebsiteScraper:
        async def scrape(self, base_url: str) -> WebsiteContent:
            nonlocal scraper_called
            scraper_called = True
            _ = base_url
            return WebsiteContent()

    class _MockSearchAggregator:
        def __init__(self, tavily_api_key: Optional[str] = None) -> None:  # noqa: UP045
            _ = tavily_api_key

        async def search(
            self,
            company_name: str,
            job_title: Optional[str] = None,  # noqa: UP045
        ) -> SearchAggregatorResult:
            _ = (company_name, job_title)
            return _make_search_response(3)

    monkeypatch.setattr("app.routers.research.WebsiteScraper", _MockWebsiteScraper)
    monkeypatch.setattr("app.routers.research.SearchAggregator", _MockSearchAggregator)
    monkeypatch.setattr(
        "app.routers.research.get_provider",
        lambda _: _MockSynthesisProvider(),
    )

    response = await async_client.post(
        "/research-company",
        json={"company_name": "Acme Corp"},
    )

    assert response.status_code == 200
    assert scraper_called is False


@pytest.mark.asyncio
async def test_research_company_scrape_failure(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Scrape exceptions should degrade gracefully when search data exists."""

    class _MockWebsiteScraper:
        async def scrape(self, base_url: str) -> WebsiteContent:
            _ = base_url
            raise RuntimeError("scrape failed")

    class _MockSearchAggregator:
        def __init__(self, tavily_api_key: Optional[str] = None) -> None:  # noqa: UP045
            _ = tavily_api_key

        async def search(
            self,
            company_name: str,
            job_title: Optional[str] = None,  # noqa: UP045
        ) -> SearchAggregatorResult:
            _ = (company_name, job_title)
            return _make_search_response(3)

    monkeypatch.setattr("app.routers.research.WebsiteScraper", _MockWebsiteScraper)
    monkeypatch.setattr("app.routers.research.SearchAggregator", _MockSearchAggregator)
    monkeypatch.setattr(
        "app.routers.research.get_provider",
        lambda _: _MockSynthesisProvider(),
    )

    response = await async_client.post(
        "/research-company",
        json={"company_name": "Acme Corp", "company_url": "https://acme.com"},
    )

    assert response.status_code == 200
    assert response.json()["profile"]["name"] == "Acme Corp"


@pytest.mark.asyncio
async def test_research_company_search_failure(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Search exceptions should degrade gracefully when website data exists."""

    class _MockWebsiteScraper:
        async def scrape(self, base_url: str) -> WebsiteContent:
            _ = base_url
            return WebsiteContent(about="Great company", raw_text_length=100)

    class _MockSearchAggregator:
        def __init__(self, tavily_api_key: Optional[str] = None) -> None:  # noqa: UP045
            _ = tavily_api_key

        async def search(
            self,
            company_name: str,
            job_title: Optional[str] = None,  # noqa: UP045
        ) -> SearchAggregatorResult:
            _ = (company_name, job_title)
            raise RuntimeError("search failed")

    monkeypatch.setattr("app.routers.research.WebsiteScraper", _MockWebsiteScraper)
    monkeypatch.setattr("app.routers.research.SearchAggregator", _MockSearchAggregator)
    monkeypatch.setattr(
        "app.routers.research.get_provider",
        lambda _: _MockSynthesisProvider(),
    )

    response = await async_client.post(
        "/research-company",
        json={"company_name": "Acme Corp", "company_url": "https://acme.com"},
    )

    assert response.status_code == 200
    assert response.json()["profile"]["name"] == "Acme Corp"


@pytest.mark.asyncio
async def test_research_company_both_fail(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """When scrape and search both fail, endpoint should return 422."""

    class _MockWebsiteScraper:
        async def scrape(self, base_url: str) -> WebsiteContent:
            _ = base_url
            raise RuntimeError("scrape failed")

    class _MockSearchAggregator:
        def __init__(self, tavily_api_key: Optional[str] = None) -> None:  # noqa: UP045
            _ = tavily_api_key

        async def search(
            self,
            company_name: str,
            job_title: Optional[str] = None,  # noqa: UP045
        ) -> SearchAggregatorResult:
            _ = (company_name, job_title)
            raise RuntimeError("search failed")

    monkeypatch.setattr("app.routers.research.WebsiteScraper", _MockWebsiteScraper)
    monkeypatch.setattr("app.routers.research.SearchAggregator", _MockSearchAggregator)

    response = await async_client.post(
        "/research-company",
        json={"company_name": "Acme Corp"},
    )

    assert response.status_code == 422
    assert "Insufficient data" in response.json()["detail"]


@pytest.mark.asyncio
async def test_research_company_llm_failure(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """LLM synthesis failures should map to HTTP 500."""

    class _MockWebsiteScraper:
        async def scrape(self, base_url: str) -> WebsiteContent:
            _ = base_url
            return WebsiteContent(about="Great company", raw_text_length=100)

    class _MockSearchAggregator:
        def __init__(self, tavily_api_key: Optional[str] = None) -> None:  # noqa: UP045
            _ = tavily_api_key

        async def search(
            self,
            company_name: str,
            job_title: Optional[str] = None,  # noqa: UP045
        ) -> SearchAggregatorResult:
            _ = (company_name, job_title)
            return _make_search_response(2)

    monkeypatch.setattr("app.routers.research.WebsiteScraper", _MockWebsiteScraper)
    monkeypatch.setattr("app.routers.research.SearchAggregator", _MockSearchAggregator)
    monkeypatch.setattr(
        "app.routers.research.get_provider",
        lambda _: _FailingSynthesisProvider(),
    )

    response = await async_client.post(
        "/research-company",
        json={"company_name": "Acme Corp", "company_url": "https://acme.com"},
    )

    assert response.status_code == 500
    assert "Research synthesis failed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_research_company_missing_name(async_client: AsyncClient) -> None:
    """Missing company_name should trigger request validation error."""
    response = await async_client.post("/research-company", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_research_company_rate_limited(
    async_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Research endpoint should be protected by the shared rate limiter."""

    class _MockWebsiteScraper:
        async def scrape(self, base_url: str) -> WebsiteContent:
            _ = base_url
            return WebsiteContent(about="Great company", raw_text_length=100)

    class _MockSearchAggregator:
        def __init__(self, tavily_api_key: Optional[str] = None) -> None:  # noqa: UP045
            _ = tavily_api_key

        async def search(
            self,
            company_name: str,
            job_title: Optional[str] = None,  # noqa: UP045
        ) -> SearchAggregatorResult:
            _ = (company_name, job_title)
            return _make_search_response(2)

    monkeypatch.setattr("app.routers.research.WebsiteScraper", _MockWebsiteScraper)
    monkeypatch.setattr("app.routers.research.SearchAggregator", _MockSearchAggregator)
    monkeypatch.setattr(
        "app.routers.research.get_provider",
        lambda _: _MockSynthesisProvider(),
    )

    statuses: list[int] = []
    for _ in range(11):
        response = await async_client.post(
            "/research-company",
            json={"company_name": "Acme Corp", "company_url": "https://acme.com"},
        )
        statuses.append(response.status_code)

    assert any(status == 429 for status in statuses)
