"""Prompt builders for ATS CV optimization."""

from app.models.schemas import OptimizationResult

SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System)
optimization consultant.

Your task: Given a candidate's CV text and a job description, produce an
ATS-optimized version of the CV that maximizes the candidate's chances of
passing automated keyword filters while remaining truthful.

Rules:
1. NEVER fabricate skills, experiences, or qualifications the candidate doesn't have
2. Mirror exact keywords and phrases from the job description where the
candidate has matching experience
3. Restructure bullet points to lead with the most relevant experience
for this specific role
4. Use standard section headings that ATS systems recognize
(Summary, Experience, Skills, Education)
5. Quantify achievements where possible
6. Remove graphics-dependent formatting descriptions (columns, icons, etc.)
7. For each section, explain what you changed and why

You must also:
- Identify keywords from the job description that are MISSING from the CV (gap analysis)
- Rate each gap as "critical", "preferred", or "nice_to_have"
- Suggest how the candidate could address each gap
- Calculate an overall ATS match score (0-100) based on keyword coverage

Respond ONLY with valid JSON matching the provided schema.
No markdown, no explanation outside the JSON."""


def build_system_prompt() -> str:
    """Return the system instruction for the LLM."""
    return SYSTEM_PROMPT


def build_user_prompt(cv_text: str, job_description: str) -> str:
    """Build the user prompt with CV/JD input and expected output schema."""
    json_schema = OptimizationResult.model_json_schema()
    return (
        "## Candidate CV\n"
        f"{cv_text}\n\n"
        "## Job Description\n"
        f"{job_description}\n\n"
        "## Output Schema\n"
        f"{json_schema}"
    )
