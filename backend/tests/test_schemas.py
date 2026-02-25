"""Validation tests for Pydantic response schemas."""

import pytest
from pydantic import ValidationError

from app.models.schemas import CvSection, Gap, OptimizationResult


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
