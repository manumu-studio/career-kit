"""OpenAI GPT-4o implementation of the LLM provider interface."""

from __future__ import annotations

import json
import re

from openai import AsyncOpenAI

from app.core.config import get_settings
from app.core.prompts import (
    build_company_system_prompt,
    build_company_user_prompt,
    build_cover_letter_system_prompt,
    build_cover_letter_user_prompt,
    build_system_prompt,
    build_user_prompt,
)
from app.core.usage_logger import calculate_estimated_cost, usage_logger
from app.models.schemas import (
    CompanyProfile,
    CompanyResearchResult,
    CoverLetterResult,
    OptimizationResult,
    UsageMetrics,
)
from app.services.llm.base import LLMProvider


class OpenAIProvider(LLMProvider):
    """OpenAI GPT-4o implementation."""

    def __init__(self) -> None:
        """Initialize provider with API client and model name."""
        settings = get_settings()
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not configured.")
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)
        self._model = "gpt-4o"
        self._input_cost_per_million = getattr(
            settings, "openai_input_cost_per_million", 2.50
        )
        self._output_cost_per_million = getattr(
            settings, "openai_output_cost_per_million", 10.00
        )

    @property
    def model_name(self) -> str:
        """Model identifier for logging and cache."""
        return self._model

    async def optimize(
        self,
        cv_text: str,
        job_description: str,
        company_name: str | None = None,
        company_context: CompanyProfile | None = None,
    ) -> OptimizationResult:
        """Generate and validate CV optimization output."""
        system = build_system_prompt()
        user_prompt = build_user_prompt(
            cv_text=cv_text,
            job_description=job_description,
            company_name=company_name,
            company_context=company_context,
        )
        response = await self._client.chat.completions.create(
            model=self._model,
            max_tokens=8192,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
        self._log_usage(response)
        self._check_finish_reason(response, "optimize")

        raw_text = self._extract_content(response)
        cleaned_text = self._strip_markdown_fences(raw_text)
        payload = self._load_json_object(cleaned_text)
        if payload is not None:
            return OptimizationResult.model_validate(payload)

        retry_response = await self._client.chat.completions.create(
            model=self._model,
            max_tokens=8192,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_prompt},
                {"role": "assistant", "content": cleaned_text},
                {
                    "role": "user",
                    "content": (
                        "Fix your JSON and return ONLY valid JSON matching "
                        "the provided schema."
                    ),
                },
            ],
            response_format={"type": "json_object"},
        )
        self._log_usage(retry_response)
        self._check_finish_reason(retry_response, "optimize retry")
        retry_text = self._extract_content(retry_response)
        retry_cleaned = self._strip_markdown_fences(retry_text)
        retry_payload = self._load_json_object(retry_cleaned)
        if retry_payload is None:
            raise ValueError("LLM returned non-JSON output after retry.")
        return OptimizationResult.model_validate(retry_payload)

    async def synthesize_company(
        self,
        company_name: str,
        website_content: str,
        search_results: str,
        job_title: str | None = None,
    ) -> CompanyResearchResult:
        """Generate and validate structured company research output."""
        system = build_company_system_prompt()
        user_prompt = build_company_user_prompt(
            company_name=company_name,
            job_title=job_title or "Not specified",
            website_content=website_content,
            search_results=search_results,
        )
        response = await self._client.chat.completions.create(
            model=self._model,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
        self._log_usage(response)
        self._check_finish_reason(response, "synthesize_company")

        raw_text = self._extract_content(response)
        cleaned_text = self._strip_markdown_fences(raw_text)
        payload = self._load_json_object(cleaned_text)
        if payload is not None:
            return CompanyResearchResult.model_validate(payload)

        retry_response = await self._client.chat.completions.create(
            model=self._model,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_prompt},
                {"role": "assistant", "content": cleaned_text},
                {
                    "role": "user",
                    "content": (
                        "Fix your JSON and return ONLY valid JSON matching "
                        "the provided schema."
                    ),
                },
            ],
            response_format={"type": "json_object"},
        )
        self._log_usage(retry_response)
        self._check_finish_reason(retry_response, "synthesize_company retry")
        retry_text = self._extract_content(retry_response)
        retry_cleaned = self._strip_markdown_fences(retry_text)
        retry_payload = self._load_json_object(retry_cleaned)
        if retry_payload is None:
            raise ValueError("LLM returned non-JSON output after retry.")
        return CompanyResearchResult.model_validate(retry_payload)

    async def generate_cover_letter(
        self,
        cv_text: str,
        job_description: str,
        company_name: str,
        hiring_manager: str | None,
        tone: str,
    ) -> CoverLetterResult:
        """Generate and validate cover letter output."""
        hiring_manager_or_default = hiring_manager or "Hiring Manager"
        user_prompt = build_cover_letter_user_prompt(
            cv_text=cv_text,
            job_description=job_description,
            company_name=company_name,
            hiring_manager_or_default=hiring_manager_or_default,
            tone=tone,
        )
        response = await self._client.chat.completions.create(
            model=self._model,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": build_cover_letter_system_prompt()},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
        self._log_usage(response)
        self._check_finish_reason(response, "generate_cover_letter")

        raw_text = self._extract_content(response)
        cleaned_text = self._strip_markdown_fences(raw_text)
        payload = self._load_json_object(cleaned_text)
        if payload is not None:
            return CoverLetterResult.model_validate(payload)

        retry_response = await self._client.chat.completions.create(
            model=self._model,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": build_cover_letter_system_prompt()},
                {"role": "user", "content": user_prompt},
                {"role": "assistant", "content": cleaned_text},
                {
                    "role": "user",
                    "content": (
                        "Fix your JSON and return ONLY valid JSON matching "
                        "the provided schema."
                    ),
                },
            ],
            response_format={"type": "json_object"},
        )
        self._log_usage(retry_response)
        self._check_finish_reason(retry_response, "generate_cover_letter retry")
        retry_text = self._extract_content(retry_response)
        retry_cleaned = self._strip_markdown_fences(retry_text)
        retry_payload = self._load_json_object(retry_cleaned)
        if retry_payload is None:
            raise ValueError("LLM returned non-JSON output after retry.")
        return CoverLetterResult.model_validate(retry_payload)

    def _log_usage(self, response: object) -> None:
        """Extract usage from OpenAI response and emit usage log."""
        usage = getattr(response, "usage", None)
        input_tokens = self._usage_value(usage, "prompt_tokens")
        output_tokens = self._usage_value(usage, "completion_tokens")
        total_tokens = input_tokens + output_tokens
        estimated_cost = calculate_estimated_cost(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            input_cost_per_million=self._input_cost_per_million,
            output_cost_per_million=self._output_cost_per_million,
        )
        usage_logger.log(
            UsageMetrics(
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens,
                estimated_cost_usd=estimated_cost,
                model=self._model,
                provider="openai",
            )
        )

    @staticmethod
    def _check_finish_reason(response: object, context: str) -> None:
        """Raise when response was truncated at token limit."""
        choice = getattr(response, "choices", None)
        if choice and len(choice) > 0:
            finish_reason = getattr(choice[0], "finish_reason", None)
            if finish_reason == "length":
                raise ValueError(
                    f"LLM response truncated at token limit during {context}. "
                    "Reduce input size or increase max_tokens."
                )

    @staticmethod
    def _usage_value(usage: object, field_name: str) -> int:
        """Return non-negative integer from usage object."""
        value = getattr(usage, field_name, 0)
        if isinstance(value, int):
            return max(0, value)
        return 0

    @staticmethod
    def _extract_content(response: object) -> str:
        """Extract text from OpenAI chat completion response."""
        choice = getattr(response, "choices", None)
        if not choice or len(choice) == 0:
            raise ValueError("OpenAI response did not include content.")
        msg = getattr(choice[0], "message", None)
        if msg is None:
            raise ValueError("OpenAI response did not include message.")
        content = getattr(msg, "content", None)
        if not isinstance(content, str) or not content.strip():
            raise ValueError("LLM response did not include text content.")
        return content.strip()

    @staticmethod
    def _strip_markdown_fences(value: str) -> str:
        """Remove leading/trailing markdown code fences if present."""
        stripped = value.strip()
        fence_match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", stripped, re.DOTALL)
        if fence_match:
            return fence_match.group(1).strip()
        return stripped

    @staticmethod
    def _load_json_object(raw_text: str) -> dict[str, object] | None:
        """Attempt JSON parsing and return dict when valid."""
        try:
            payload = json.loads(raw_text)
        except json.JSONDecodeError:
            return None
        if isinstance(payload, dict):
            return payload
        return None
