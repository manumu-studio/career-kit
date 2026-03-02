"""Unit tests for CompanySynthesizer.

Validates formatting, truncation, quality assessment, and LLM delegation.
"""

from __future__ import annotations

import os
from typing import Optional

import pytest

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from app.models.schemas import (
    CompanyProfile,
    CompanyReport,
    CompanyResearchResult,
    EmployeeSentiment,
    OptimizationResult,
    SearchResult,
    WebsiteContent,
)
from app.services.llm.base import LLMProvider
from app.services.research.synthesizer import CompanySynthesizer


class _MockSynthesisProvider(LLMProvider):
    """Mock LLM provider returning deterministic company synthesis output."""

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
        """Return a complete deterministic result for synthesizer tests."""
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
            sources_used=[],
            research_quality="medium",
            researched_at="2026-01-01T00:00:00+00:00",
        )


def _make_search_results(count: int) -> list[SearchResult]:
    """Build deterministic search results for synthesizer tests."""
    return [
        SearchResult(
            title=f"Result {i}",
            content=f"Content block {i}",
            url=f"https://example.com/{i}",
            relevance_score=0.8,
            query_used="query",
        )
        for i in range(count)
    ]


def test_format_website_content_all_fields() -> None:
    """Formatter should include all labels when every field exists."""
    synthesizer = CompanySynthesizer()
    content = WebsiteContent(
        about="About text",
        careers="Careers text",
        values="Values text",
        leadership="Leadership text",
        blog_posts=["Post 1", "Post 2"],
        raw_text_length=50,
    )

    output = synthesizer._format_website_content(content)

    assert output.startswith("[Company Website Content]")
    assert "About:" in output
    assert "Careers:" in output
    assert "Values:" in output
    assert "Leadership:" in output
    assert "Blog:" in output


def test_format_website_content_partial() -> None:
    """Formatter should include only populated website sections."""
    synthesizer = CompanySynthesizer()
    content = WebsiteContent(about="About text", careers="Careers text")

    output = synthesizer._format_website_content(content)

    assert "About:" in output
    assert "Careers:" in output
    assert "Values:" not in output
    assert "Leadership:" not in output
    assert "Blog:" not in output


def test_format_website_content_empty() -> None:
    """Formatter should emit fallback text when no website content exists."""
    synthesizer = CompanySynthesizer()
    output = synthesizer._format_website_content(WebsiteContent())

    assert "No website data available." in output


def test_format_search_results() -> None:
    """Search formatter should include numbered entries and source URLs."""
    synthesizer = CompanySynthesizer()
    results = _make_search_results(3)

    output = synthesizer._format_search_results(results)

    assert "Result 1" in output
    assert "Result 2" in output
    assert "Result 3" in output
    for result in results:
        assert result.url in output


def test_truncation_within_limit() -> None:
    """Text below budget should remain unchanged after truncation."""
    synthesizer = CompanySynthesizer()
    website_text = "w" * 1000
    search_text = "s" * 1000

    truncated_website, truncated_search = synthesizer._truncate_context(
        website_text, search_text
    )

    assert truncated_website == website_text
    assert truncated_search == search_text


def test_truncation_exceeds_limit() -> None:
    """Text above budget should be split according to truncation strategy."""
    synthesizer = CompanySynthesizer()
    website_text = "w" * 30_000
    search_text = "s" * 30_000

    truncated_website, truncated_search = synthesizer._truncate_context(
        website_text, search_text
    )

    assert len(truncated_website) + len(truncated_search) <= 50_000
    assert len(truncated_website) == 25_000
    assert len(truncated_search) == 25_000


def test_quality_assessment() -> None:
    """Quality scoring should map low/medium/high based on source richness."""
    synthesizer = CompanySynthesizer()
    assert (
        synthesizer._assess_quality(
            WebsiteContent(raw_text_length=5000),
            _make_search_results(5),
            "tavily",
        )
        == "high"
    )
    assert (
        synthesizer._assess_quality(
            WebsiteContent(raw_text_length=5000),
            _make_search_results(3),
            "duckduckgo",
        )
        == "medium"
    )
    assert synthesizer._assess_quality(WebsiteContent(), [], "duckduckgo") == "low"


def test_collect_sources_capped_at_max() -> None:
    """Source collection should enforce the MAX_SOURCES guardrail."""
    synthesizer = CompanySynthesizer()
    sources = synthesizer._collect_sources(
        _make_search_results(20),
        base_url="https://acme.com",
    )

    assert len(sources) <= 10
    assert sources[0] == "https://acme.com"


@pytest.mark.asyncio
async def test_synthesize_calls_llm_and_enriches() -> None:
    """Synthesize should call provider and add metadata fields to response."""
    synthesizer = CompanySynthesizer()
    provider = _MockSynthesisProvider()
    search_results = _make_search_results(20)

    result = await synthesizer.synthesize(
        company_name="Acme Corp",
        website_content=WebsiteContent(about="Great place", raw_text_length=2000),
        search_results=search_results,
        job_title="Engineer",
        llm_provider=provider,
        provider_used="tavily",
        base_url="https://acme.com",
    )

    assert result.profile.name == "Acme Corp"
    assert result.research_quality in {"high", "medium", "low"}
    assert isinstance(result.sources_used, list)
    assert len(result.sources_used) <= 10
    assert result.researched_at.endswith("+00:00")
