"""Abstract base class for LLM providers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.models.schemas import (
    CompanyProfile,
    CompanyResearchResult,
    CoverLetterResult,
    OptimizationResult,
)


class LLMProvider(ABC):
    """Base class for LLM providers."""

    @property
    def model_name(self) -> str:
        """Model identifier for logging and cache. Override in subclasses."""
        return "unknown"

    @abstractmethod
    async def optimize(
        self,
        cv_text: str,
        job_description: str,
        company_name: Optional[str] = None,  # noqa: UP045
        company_context: Optional[CompanyProfile] = None,  # noqa: UP045
    ) -> OptimizationResult:
        """Analyze CV and job description, then return structured optimization data.

        Args:
            cv_text: Extracted text from a candidate's CV.
            job_description: The target role description.

        Returns:
            Validated optimization output in the API response shape.

        Notes:
            Implementations should log UsageMetrics for each outbound LLM call.
        """
        ...

    @abstractmethod
    async def synthesize_company(
        self,
        company_name: str,
        website_content: str,
        search_results: str,
        job_title: Optional[str] = None,  # noqa: UP045
    ) -> CompanyResearchResult:
        """Synthesize scraped company research data into structured output."""
        ...

    @abstractmethod
    async def generate_cover_letter(
        self,
        cv_text: str,
        job_description: str,
        company_name: str,
        hiring_manager: str | None,
        tone: str,
    ) -> CoverLetterResult:
        """Generate a tailored cover letter from CV + JD + company context."""
        ...
