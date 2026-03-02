"""Company research endpoint orchestrating scrape, search, and synthesis pipeline."""

from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.models.schemas import (
    CompanyResearchRequest,
    CompanyResearchResult,
    ErrorResponse,
    SearchAggregatorResult,
    WebsiteContent,
)
from app.services.llm.factory import get_provider
from app.services.research.search_aggregator import SearchAggregator
from app.services.research.synthesizer import CompanySynthesizer
from app.services.research.website_scraper import WebsiteScraper

logger = logging.getLogger(__name__)
router = APIRouter(tags=["research"])


@router.post(
    "/research-company",
    response_model=CompanyResearchResult,
    responses={
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        504: {"model": ErrorResponse},
    },
)
async def research_company(request: CompanyResearchRequest) -> CompanyResearchResult:
    """Run company research pipeline with timeout and graceful fallbacks."""
    try:
        return await asyncio.wait_for(_run_pipeline(request), timeout=90.0)
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail="Research timed out.") from exc


async def _run_pipeline(request: CompanyResearchRequest) -> CompanyResearchResult:
    """Execute concurrent scrape/search and perform synthesis."""
    website_content, search_result = await asyncio.gather(
        _safe_scrape(request.company_url),
        _safe_search(request.company_name, request.job_title),
    )
    if website_content.raw_text_length == 0 and len(search_result.results) == 0:
        raise HTTPException(
            status_code=422,
            detail="Insufficient data to research this company.",
        )

    try:
        provider = get_provider(settings.llm_provider)
        return await CompanySynthesizer().synthesize(
            company_name=request.company_name,
            website_content=website_content,
            search_results=search_result.results,
            job_title=request.job_title,
            llm_provider=provider,
            provider_used=search_result.provider_used,
            base_url=request.company_url,
        )
    except Exception as exc:
        logger.error(
            "Research synthesis failed for %s", request.company_name, exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="Research synthesis failed.",
        ) from exc


async def _safe_scrape(company_url: str | None) -> WebsiteContent:
    """Scrape company website when URL exists, otherwise return empty content."""
    if not company_url:
        return WebsiteContent()
    try:
        return await WebsiteScraper().scrape(company_url)
    except Exception:
        logger.warning("Website scrape failed for URL: %s", company_url, exc_info=True)
        return WebsiteContent()


async def _safe_search(
    company_name: str,
    job_title: str | None,
) -> SearchAggregatorResult:
    """Run search aggregation and return empty fallback output on failures."""
    try:
        return await SearchAggregator(settings.tavily_api_key).search(
            company_name=company_name,
            job_title=job_title,
        )
    except Exception:
        logger.warning(
            "Search aggregation failed for company: %s", company_name, exc_info=True
        )
        return SearchAggregatorResult(
            results=[],
            provider_used="duckduckgo",
            queries_run=0,
            total_results=0,
        )
