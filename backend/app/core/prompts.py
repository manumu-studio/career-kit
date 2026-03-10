"""Prompt builders for CV optimization, company research, and cover letter workflows."""

from typing import Literal, Optional

from app.core.i18n import LANGUAGE_NAMES
from app.models.schemas import (
    CompanyProfile,
    CompanyResearchResult,
    CoverLetterResult,
    OptimizationResult,
)

SYSTEM_PROMPT = """You are an expert CV optimization consultant.

Your task: Given a candidate's CV text and a job description, produce a
job-tailored version of the CV that maximizes the candidate's chances of
passing keyword filters while remaining truthful.

Rules:
1. NEVER fabricate skills, experiences, or qualifications the candidate doesn't have
2. Mirror exact keywords and phrases from the job description where the
candidate has matching experience
3. Restructure bullet points to lead with the most relevant experience
for this specific role
4. Use standard section headings that recruitment systems recognize
(Summary, Experience, Skills, Education)
5. Quantify achievements where possible
6. Remove graphics-dependent formatting descriptions (columns, icons, etc.)
7. For each section, explain what you changed and why

You must also:
- Identify keywords from the job description that are MISSING from the CV (gap analysis)
- Rate each gap as "critical", "preferred", or "nice_to_have"
- Suggest how the candidate could address each gap
- Calculate an overall match score (0-100) based on keyword coverage

Respond ONLY with valid JSON matching the provided schema.
No markdown, no explanation outside the JSON."""

COMPANY_CONTEXT_PROMPT_ADDITION = """
## Company Context
The candidate is applying to {company_name}.

Company values: {core_values}
Culture keywords: {culture_keywords}
Keywords to mirror: {keywords_to_mirror}

Additional optimization rules when company context is available:
8. Mirror the company's core values where the candidate has genuine alignment
9. Use culture keywords naturally in descriptions of work style and achievements
10. Incorporate keywords_to_mirror verbatim where they match the candidate's experience
11. Align the CV's professional summary with the company's mission
"""

COMPANY_RESEARCH_SYSTEM_PROMPT = """You are a career intelligence analyst.
Given raw data scraped from a company's website and public search results,
produce a comprehensive company profile and interview preparation report.

Your task:
1. Synthesize all available data into a structured company profile
2. Generate a human-readable report optimized for interview preparation
3. Identify exact keywords and phrases the candidate should mirror in CV
   and cover letter

Rules:
1. Only state facts supported by the provided data - never fabricate
2. If data is limited, say so honestly in the research_quality field
3. Distinguish verified info (company website) from opinions (reviews/Reddit)
4. Present both pros and cons for employee sentiment
5. keywords_to_mirror must use exact source phrases when available
6. If job_title is provided, weight analysis toward that role
7. Red flags should be fair pattern-based observations
8. Talking points should be specific and actionable

Respond ONLY with valid JSON matching the provided schema."""

LANGUAGE_INSTRUCTION = (
    "\n\nIMPORTANT: Generate all output text (sections, summaries, "
    "suggestions, etc.) in {language_name}."
)


def build_system_prompt(
    language: Literal["en", "es"] = "en",
) -> str:
    """Return the system instruction for the LLM."""
    lang_name = LANGUAGE_NAMES.get(language, "English")
    return SYSTEM_PROMPT + LANGUAGE_INSTRUCTION.format(language_name=lang_name)


def build_user_prompt(
    cv_text: str,
    job_description: str,
    company_name: Optional[str] = None,  # noqa: UP045
    company_context: Optional[CompanyProfile] = None,  # noqa: UP045
) -> str:
    """Build the user prompt with CV/JD input and expected output schema."""
    json_schema = OptimizationResult.model_json_schema()
    company_context_section = ""
    if company_name and company_context:
        company_context_section = COMPANY_CONTEXT_PROMPT_ADDITION.format(
            company_name=company_name,
            core_values=", ".join(company_context.core_values),
            culture_keywords=", ".join(company_context.culture_keywords),
            keywords_to_mirror=", ".join(company_context.core_values[:5]),
        )
    return (
        "## Candidate CV\n"
        f"{cv_text}\n\n"
        "## Job Description\n"
        f"{job_description}\n\n"
        f"{company_context_section}\n\n"
        "## Output Schema\n"
        f"{json_schema}"
    )


def build_company_system_prompt(
    language: Literal["en", "es"] = "en",
) -> str:
    """Return the system instruction for company research synthesis."""
    lang_name = LANGUAGE_NAMES.get(language, "English")
    return COMPANY_RESEARCH_SYSTEM_PROMPT + LANGUAGE_INSTRUCTION.format(
        language_name=lang_name
    )


COVER_LETTER_SYSTEM_PROMPT = (  # noqa: E501
    """You are an expert career consultant who writes compelling,
    personalized cover letters.

Your task: Given a candidate's CV text, a job description, and company information,
write a tailored cover letter that complements (not duplicates) the CV.

Rules:
1. NEVER fabricate experiences or qualifications the candidate doesn't have
2. Lead with the strongest alignment between the candidate's experience and the role
3. Reference specific company details when possible
4. Keep the tone consistent throughout — match the requested tone exactly
5. Aim for 250-400 words (3-4 paragraphs)
6. Avoid generic phrases like "I am writing to express my interest"
7. Each paragraph should have a distinct purpose (hook, evidence, value, close)
8. Mirror key terminology from the job description naturally

Tone guidelines:
- "professional": formal business language, measured confidence
- "conversational": warm but competent, slight personality showing
- "enthusiastic": high energy, genuine excitement, still credible

Respond ONLY with valid JSON matching the provided schema.
No markdown, no explanation outside the JSON."""
)


def build_cover_letter_system_prompt(
    language: Literal["en", "es"] = "en",
) -> str:
    """Return the system instruction for cover letter generation."""
    lang_name = LANGUAGE_NAMES.get(language, "English")
    return COVER_LETTER_SYSTEM_PROMPT + LANGUAGE_INSTRUCTION.format(
        language_name=lang_name
    )


def build_cover_letter_user_prompt(
    cv_text: str,
    job_description: str,
    company_name: str,
    hiring_manager_or_default: str,
    tone: str,
) -> str:
    """Build user prompt for cover letter generation with output schema."""
    json_schema = CoverLetterResult.model_json_schema()
    return (
        "## Candidate CV\n"
        f"{cv_text}\n\n"
        "## Job Description\n"
        f"{job_description}\n\n"
        "## Company\n"
        f"{company_name}\n\n"
        "## Address To\n"
        f"{hiring_manager_or_default}\n\n"
        "## Tone\n"
        f"{tone}\n\n"
        "## Output Schema\n"
        f"{json_schema}"
    )


def build_company_user_prompt(
    company_name: str,
    job_title: str,
    website_content: str,
    search_results: str,
) -> str:
    """Build user prompt for company synthesis with explicit output schema."""
    json_schema = CompanyResearchResult.model_json_schema()
    return (
        "## Company\n"
        f"{company_name}\n\n"
        "## Job Title\n"
        f"{job_title}\n\n"
        "## Company Website Content\n"
        f"{website_content}\n\n"
        "## Public Search Results\n"
        f"{search_results}\n\n"
        "## Output Schema\n"
        f"{json_schema}"
    )
