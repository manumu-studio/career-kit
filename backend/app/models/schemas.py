"""Request and response schemas for optimization endpoints."""

from typing import Literal

from pydantic import BaseModel, Field


class Gap(BaseModel):
    """Represents a missing or weak skill for a target role."""

    skill: str
    importance: Literal["critical", "preferred", "nice_to_have"]
    suggestion: str


class CvSection(BaseModel):
    """Represents original and optimized content for a CV section."""

    heading: str
    original: str
    optimized: str
    changes_made: list[str]


class OptimizationResult(BaseModel):
    """Structured optimization output consumed by the frontend."""

    sections: list[CvSection]
    gap_analysis: list[Gap]
    keyword_matches: list[str]
    keyword_misses: list[str]
    match_score: int = Field(ge=0, le=100)
    summary: str


class UsageMetrics(BaseModel):
    """Tracks token usage and estimated spend for one LLM request."""

    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(ge=0)
    total_tokens: int = Field(ge=0)
    estimated_cost_usd: float = Field(ge=0)
    model: str
    provider: str


class ErrorResponse(BaseModel):
    """Standard API error payload."""

    detail: str
