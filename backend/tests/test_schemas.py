"""Validation tests for Pydantic response schemas."""

import pytest
from pydantic import ValidationError

from app.models.schemas import (
    CompanyProfile,
    CompanyReport,
    CompanyResearchResult,
    CoverLetterResult,
    CvSection,
    Gap,
    OptimizationResult,
)


def test_optimization_result_accepts_valid_data() -> None:
    """Valid schema payload should parse successfully."""
    result = OptimizationResult(
        sections=[
            CvSection(
                heading="Experience",
                original="Built APIs.",
                optimized="Designed and built resilient APIs.",
                changes_made=["Added action verbs", "Improved impact language"],
            )
        ],
        gap_analysis=[
            Gap(
                skill="Kubernetes",
                importance="preferred",
                suggestion="Add one production deployment bullet.",
            )
        ],
        keyword_matches=["FastAPI", "Python"],
        keyword_misses=["AWS"],
        match_score=82,
        summary="Strong backend alignment with minor cloud gaps.",
    )

    assert result.match_score == 82
    assert result.gap_analysis[0].importance == "preferred"


def test_optimization_result_rejects_out_of_range_score() -> None:
    """Match score outside 0-100 should fail validation."""
    with pytest.raises(ValidationError):
        OptimizationResult(
            sections=[],
            gap_analysis=[],
            keyword_matches=[],
            keyword_misses=[],
            match_score=101,
            summary="Invalid score example.",
        )


def test_gap_rejects_invalid_importance() -> None:
    """Gap importance must be one of the allowed literal values."""
    with pytest.raises(ValidationError):
        Gap(
            skill="Go",
            importance="mandatory",
            suggestion="Add relevant backend projects.",
        )


def test_cover_letter_result_accepts_valid_data() -> None:
    """Valid CoverLetterResult schema should parse successfully."""
    result = CoverLetterResult(
        greeting="Dear Hiring Manager,",
        opening_paragraph="I am excited to apply.",
        body_paragraphs=["Paragraph 1.", "Paragraph 2."],
        closing_paragraph="Thank you for your consideration.",
        sign_off="Sincerely, Jane",
        key_selling_points=["Python", "FastAPI"],
        tone_used="professional",
        word_count=250,
    )
    assert result.word_count == 250
    assert len(result.body_paragraphs) == 2


def test_company_research_result_accepts_valid_data() -> None:
    """Valid CompanyResearchResult schema should parse successfully."""
    profile = CompanyProfile(
        name="Acme",
        website="https://acme.com",
        industry="Tech",
        size_estimate="100-500",
        core_values=["Innovation"],
        culture_keywords=["remote"],
        tech_stack=["Python"],
        recent_news=[],
        interview_insights=[],
        employee_sentiment={
            "overall": "positive",
            "pros": [],
            "cons": [],
            "summary": "",
        },
        benefits_highlights=[],
        leadership_names=[],
    )
    report = CompanyReport(
        executive_summary="Summary",
        culture_and_values="Values",
        what_they_look_for="Skills",
        interview_preparation="Tips",
        recent_developments="News",
        red_flags=[],
        talking_points=[],
        keywords_to_mirror=[],
    )
    result = CompanyResearchResult(
        profile=profile,
        report=report,
        sources_used=[],
        research_quality="high",
        researched_at="2024-01-15T12:00:00Z",
    )
    assert result.research_quality == "high"
    assert result.profile.name == "Acme"
