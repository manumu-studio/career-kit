"""Request and response schemas for optimization and research endpoints."""

from typing import Literal, Optional

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


class WebsiteContent(BaseModel):
    """Structured content extracted from a company website."""

    about: Optional[str] = None  # noqa: UP045
    careers: Optional[str] = None  # noqa: UP045
    values: Optional[str] = None  # noqa: UP045
    blog_posts: list[str] = Field(default_factory=list)
    leadership: Optional[str] = None  # noqa: UP045
    raw_text_length: int = 0


class SearchResult(BaseModel):
    """Single search result from a search provider."""

    title: str
    content: str
    url: str
    relevance_score: Optional[float] = None  # noqa: UP045
    query_used: str


class SearchAggregatorResult(BaseModel):
    """Aggregated company research search output."""

    results: list[SearchResult]
    provider_used: str
    queries_run: int
    total_results: int


class NewsItem(BaseModel):
    """News item relevant to the company."""

    headline: str
    source: str
    date: Optional[str] = None  # noqa: UP045
    relevance: str


class InterviewInsight(BaseModel):
    """Interview tip from public sources."""

    tip: str
    source: str
    role_specific: bool


class EmployeeSentiment(BaseModel):
    """Aggregated employee sentiment from reviews."""

    overall: Literal["positive", "mixed", "negative"]
    pros: list[str]
    cons: list[str]
    summary: str


class CompanyProfile(BaseModel):
    """Structured company data for CV optimization."""

    name: str
    website: Optional[str] = None  # noqa: UP045
    industry: str
    size_estimate: str
    mission_statement: Optional[str] = None  # noqa: UP045
    core_values: list[str]
    culture_keywords: list[str]
    tech_stack: list[str]
    recent_news: list[NewsItem]
    interview_insights: list[InterviewInsight]
    employee_sentiment: EmployeeSentiment
    benefits_highlights: list[str]
    leadership_names: list[str]


class CompanyReport(BaseModel):
    """Human-readable company report for interview preparation."""

    executive_summary: str
    culture_and_values: str
    what_they_look_for: str
    interview_preparation: str
    recent_developments: str
    red_flags: list[str]
    talking_points: list[str]
    keywords_to_mirror: list[str]


class CompanyResearchResult(BaseModel):
    """Complete company research output."""

    profile: CompanyProfile
    report: CompanyReport
    sources_used: list[str]
    research_quality: Literal["high", "medium", "low"]
    researched_at: str


class CompanyResearchRequest(BaseModel):
    """Request body for POST /research-company endpoint."""

    company_name: str
    company_url: Optional[str] = None  # noqa: UP045
    job_title: Optional[str] = None  # noqa: UP045
