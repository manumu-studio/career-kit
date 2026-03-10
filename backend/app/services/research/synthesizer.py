"""Company intelligence synthesizer orchestrating LLM synthesis pipeline."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional

from app.models.schemas import CompanyResearchResult, SearchResult, WebsiteContent
from app.services.llm.base import LLMProvider


class CompanySynthesizer:
    """Formats source context and delegates company synthesis to the LLM provider."""

    MAX_CONTEXT_CHARS: int = 50_000
    MAX_SOURCES: int = 10

    async def synthesize(
        self,
        company_name: str,
        website_content: WebsiteContent,
        search_results: list[SearchResult],
        job_title: Optional[str],  # noqa: UP045
        llm_provider: LLMProvider,
        provider_used: str,
        base_url: Optional[str] = None,  # noqa: UP045
        language: str = "en",
    ) -> CompanyResearchResult:
        """Synthesize website/search data and enrich with metadata fields."""
        website_text = self._format_website_content(website_content)
        search_text = self._format_search_results(search_results)
        website_context, search_context = self._truncate_context(
            website_text,
            search_text,
        )

        result = await llm_provider.synthesize_company(
            company_name=company_name,
            website_content=website_context,
            search_results=search_context,
            job_title=job_title,
            language=language,
        )
        sources = self._collect_sources(search_results, base_url)
        quality = self._assess_quality(website_content, search_results, provider_used)

        return result.model_copy(
            update={
                "sources_used": sources,
                "research_quality": quality,
                "researched_at": datetime.now(timezone.utc).isoformat(),  # noqa: UP017
            }
        )

    def _format_website_content(self, content: WebsiteContent) -> str:
        """Format structured website text into readable prompt context."""
        blocks: list[str] = ["[Company Website Content]"]
        if content.about:
            blocks.append(f"About: {content.about}")
        if content.careers:
            blocks.append(f"Careers: {content.careers}")
        if content.values:
            blocks.append(f"Values: {content.values}")
        if content.leadership:
            blocks.append(f"Leadership: {content.leadership}")
        if content.blog_posts:
            blocks.append("Blog:")
            for post in content.blog_posts:
                blocks.append(f"- {post}")
        if len(blocks) == 1:
            blocks.append("No website data available.")
        return "\n".join(blocks)

    def _format_search_results(self, results: list[SearchResult]) -> str:
        """Format search results with source attribution for prompt context."""
        if not results:
            return "[Public Search Results]\nNo search data available."

        lines: list[str] = ["[Public Search Results]"]
        for index, result in enumerate(results, start=1):
            lines.extend(
                [
                    f"Result {index}",
                    f"Title: {result.title}",
                    f"URL: {result.url}",
                    f"Query: {result.query_used}",
                    f"Content: {result.content}",
                ]
            )
        return "\n".join(lines)

    def _truncate_context(self, website_text: str, search_text: str) -> tuple[str, str]:
        """Truncate combined context to fit LLM token budget constraints."""
        total_length = len(website_text) + len(search_text)
        if total_length <= self.MAX_CONTEXT_CHARS:
            return website_text, search_text

        website_budget = min(len(website_text), self.MAX_CONTEXT_CHARS // 2)
        search_budget = self.MAX_CONTEXT_CHARS - website_budget
        return website_text[:website_budget], search_text[:search_budget]

    def _assess_quality(
        self,
        website_content: WebsiteContent,
        search_results: list[SearchResult],
        provider_used: str,
    ) -> Literal["high", "medium", "low"]:
        """Assess research quality based on data richness and provider quality."""
        website_chars = website_content.raw_text_length
        search_chars = sum(len(result.content) for result in search_results)
        total_chars = website_chars + search_chars

        if total_chars < 500:
            return "low"
        if website_chars > 0 and search_results and provider_used == "tavily":
            return "high"
        return "medium"

    def _collect_sources(
        self,
        search_results: list[SearchResult],
        base_url: Optional[str],  # noqa: UP045
    ) -> list[str]:
        """Collect unique sources from search results and optional company URL."""
        seen: set[str] = set()
        sources: list[str] = []

        if base_url and base_url not in seen:
            seen.add(base_url)
            sources.append(base_url)
        for result in search_results:
            url = result.url.strip()
            if not url or url in seen:
                continue
            seen.add(url)
            sources.append(url)
            if len(sources) >= self.MAX_SOURCES:
                break
        return sources
