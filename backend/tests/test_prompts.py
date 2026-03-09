"""Unit tests for prompt template generation."""

from __future__ import annotations

from app.core.prompts import (
    build_cover_letter_system_prompt,
    build_cover_letter_user_prompt,
    build_system_prompt,
    build_user_prompt,
)
from app.models.schemas import CompanyProfile


class TestBuildSystemPrompt:
    """Tests for build_system_prompt."""

    def test_returns_non_empty_string(self) -> None:
        """System prompt contains expected structure."""
        prompt = build_system_prompt()
        assert len(prompt) > 0
        assert "CV" in prompt or "cv" in prompt.lower()
        assert "job description" in prompt.lower()
        assert "JSON" in prompt


class TestBuildUserPrompt:
    """Tests for build_user_prompt."""

    def test_includes_cv_and_job_description(self) -> None:
        """User prompt includes CV text and job description placeholders."""
        prompt = build_user_prompt(
            cv_text="Jane Doe, 5 years Python.",
            job_description="Senior Backend Engineer.",
        )
        assert "Jane Doe" in prompt
        assert "Senior Backend Engineer" in prompt
        assert "## Candidate CV" in prompt
        assert "## Job Description" in prompt
        assert "Output Schema" in prompt

    def test_includes_company_context_when_provided(self) -> None:
        """User prompt includes company context section when provided."""
        profile = CompanyProfile(
            name="Acme",
            website="https://acme.com",
            industry="Tech",
            size_estimate="100-500",
            core_values=["Innovation", "Quality"],
            culture_keywords=["remote", "agile"],
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
        prompt = build_user_prompt(
            cv_text="CV",
            job_description="JD",
            company_name="Acme",
            company_context=profile,
        )
        assert "Acme" in prompt
        assert "Innovation" in prompt
        assert "Company Context" in prompt


class TestBuildCoverLetterPrompt:
    """Tests for cover letter prompts."""

    def test_cover_letter_system_prompt_contains_tone_guidelines(self) -> None:
        """Cover letter system prompt includes tone guidelines."""
        prompt = build_cover_letter_system_prompt()
        assert "professional" in prompt
        assert "conversational" in prompt
        assert "enthusiastic" in prompt

    def test_cover_letter_user_prompt_includes_tone_and_company(
        self,
    ) -> None:
        """Cover letter user prompt includes tone and company context."""
        prompt = build_cover_letter_user_prompt(
            cv_text="CV text",
            job_description="JD",
            company_name="Acme Inc",
            hiring_manager_or_default="Hiring Manager",
            tone="professional",
        )
        assert "CV text" in prompt
        assert "JD" in prompt
        assert "Acme Inc" in prompt
        assert "Hiring Manager" in prompt
        assert "professional" in prompt
        assert "Output Schema" in prompt
