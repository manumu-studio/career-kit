"""Shared pytest fixtures for backend tests."""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from app.main import app
from app.models.schemas import CoverLetterResult, OptimizationResult
from app.services.llm.base import LLMProvider


def _make_optimization_result() -> OptimizationResult:
    """Deterministic optimization result for testing."""
    return OptimizationResult(
        sections=[
            {
                "heading": "Experience",
                "original": "Built APIs.",
                "optimized": "Built resilient APIs aligned to role priorities.",
                "changes_made": ["Added job-aligned keywords"],
            }
        ],
        gap_analysis=[
            {
                "skill": "AWS",
                "importance": "preferred",
                "suggestion": "Add one cloud deployment bullet where applicable.",
            }
        ],
        keyword_matches=["Python", "FastAPI"],
        keyword_misses=["AWS"],
        match_score=85,
        summary="Strong backend fit with one notable cloud tooling gap.",
    )


def _make_cover_letter_result() -> CoverLetterResult:
    """Deterministic cover letter result for testing."""
    return CoverLetterResult(
        greeting="Dear Hiring Manager,",
        opening_paragraph="I am excited to apply for this role.",
        body_paragraphs=[
            "With 5 years of backend experience...",
            "I have led teams and delivered...",
        ],
        closing_paragraph="I would welcome the opportunity to discuss.",
        sign_off="Sincerely, Jane Doe",
        key_selling_points=[
            "5 years backend experience",
            "Team leadership",
            "FastAPI and Python expertise",
        ],
        tone_used="professional",
        word_count=280,
    )


@pytest.fixture
def mock_optimization_result() -> OptimizationResult:
    """Deterministic optimization result fixture."""
    return _make_optimization_result()


@pytest.fixture
def mock_cover_letter_result() -> CoverLetterResult:
    """Deterministic cover letter result fixture."""
    return _make_cover_letter_result()


@pytest.fixture
def mock_llm_provider(
    mock_optimization_result: OptimizationResult,
    mock_cover_letter_result: CoverLetterResult,
) -> AsyncMock:
    """Mock LLM provider with deterministic optimize and generate_cover_letter."""
    provider = AsyncMock(spec=LLMProvider)
    provider.optimize.return_value = mock_optimization_result
    provider.generate_cover_letter.return_value = mock_cover_letter_result
    return provider


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Provide AsyncClient configured against the in-process ASGI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://testserver",
        headers={"X-User-Id": "test-user"},
    ) as client:
        yield client
