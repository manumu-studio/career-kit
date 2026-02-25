"""Abstract base class for LLM providers."""

from abc import ABC, abstractmethod

from app.models.schemas import OptimizationResult


class LLMProvider(ABC):
    """Base class for LLM providers."""

    @abstractmethod
    async def optimize(self, cv_text: str, job_description: str) -> OptimizationResult:
        """Analyze CV and job description, then return structured optimization data.

        Args:
            cv_text: Extracted text from a candidate's CV.
            job_description: The target role description.

        Returns:
            Validated optimization output in the API response shape.
        """
        ...
