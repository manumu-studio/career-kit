"""Google Gemini 2.0 Flash implementation of the LLM provider interface."""

from __future__ import annotations

import json
import re

from google import genai
from google.genai import types

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


class GeminiProvider(LLMProvider):
    """Google Gemini 2.0 Flash implementation."""

    def __init__(self) -> None:
        """Initialize provider with API client and model name."""
        settings = get_settings()
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")
        self._client = genai.Client(api_key=settings.gemini_api_key)
        self._model = "gemini-2.0-flash"
        self._input_cost_per_million = getattr(
            settings, "gemini_input_cost_per_million", 0.10
        )
        self._output_cost_per_million = getattr(
            settings, "gemini_output_cost_per_million", 0.40
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
        full_prompt = f"{system}\n\n{user_prompt}"
        response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=8192,
                response_mime_type="application/json",
            ),
        )
        self._log_usage(response)
        self._check_finish_reason(response, "optimize")

        raw_text = self._extract_text(response)
        cleaned_text = self._strip_markdown_fences(raw_text)
        payload = self._load_json_object(cleaned_text)
        if payload is not None:
            return OptimizationResult.model_validate(payload)

        retry_prompt = (
            f"{full_prompt}\n\n"
            "Fix your JSON and return ONLY valid JSON matching the schema."
        )
        retry_response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=retry_prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=8192,
                response_mime_type="application/json",
            ),
        )
        self._log_usage(retry_response)
        self._check_finish_reason(retry_response, "optimize retry")
        retry_text = self._extract_text(retry_response)
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
        full_prompt = f"{system}\n\n{user_prompt}"
        response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=4096,
                response_mime_type="application/json",
            ),
        )
        self._log_usage(response)
        self._check_finish_reason(response, "synthesize_company")

        raw_text = self._extract_text(response)
        cleaned_text = self._strip_markdown_fences(raw_text)
        payload = self._load_json_object(cleaned_text)
        if payload is not None:
            return CompanyResearchResult.model_validate(payload)

        retry_prompt = (
            f"{full_prompt}\n\n"
            "Fix your JSON and return ONLY valid JSON matching the schema."
        )
        retry_response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=retry_prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=4096,
                response_mime_type="application/json",
            ),
        )
        self._log_usage(retry_response)
        self._check_finish_reason(retry_response, "synthesize_company retry")
        retry_text = self._extract_text(retry_response)
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
        full_prompt = f"{build_cover_letter_system_prompt()}\n\n{user_prompt}"
        response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=4096,
                response_mime_type="application/json",
            ),
        )
        self._log_usage(response)
        self._check_finish_reason(response, "generate_cover_letter")

        raw_text = self._extract_text(response)
        cleaned_text = self._strip_markdown_fences(raw_text)
        payload = self._load_json_object(cleaned_text)
        if payload is not None:
            return CoverLetterResult.model_validate(payload)

        retry_prompt = (
            f"{full_prompt}\n\n"
            "Fix your JSON and return ONLY valid JSON matching the schema."
        )
        retry_response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=retry_prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=4096,
                response_mime_type="application/json",
            ),
        )
        self._log_usage(retry_response)
        self._check_finish_reason(retry_response, "generate_cover_letter retry")
        retry_text = self._extract_text(retry_response)
        retry_cleaned = self._strip_markdown_fences(retry_text)
        retry_payload = self._load_json_object(retry_cleaned)
        if retry_payload is None:
            raise ValueError("LLM returned non-JSON output after retry.")
        return CoverLetterResult.model_validate(retry_payload)

    def _log_usage(self, response: object) -> None:
        """Extract usage from Gemini response and emit usage log."""
        usage = getattr(response, "usage_metadata", None)
        input_tokens = self._usage_value(usage, "prompt_token_count")
        output_tokens = self._usage_value(usage, "response_token_count")
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
                provider="gemini",
            )
        )

    @staticmethod
    def _check_finish_reason(response: object, context: str) -> None:
        """Raise when response was truncated or blocked."""
        candidates = getattr(response, "candidates", None)
        if candidates and len(candidates) > 0:
            finish_reason = getattr(candidates[0], "finish_reason", None)
            if finish_reason and str(finish_reason).endswith("MAX_TOKENS"):
                raise ValueError(
                    f"LLM response truncated at token limit during {context}. "
                    "Reduce input size or increase max_output_tokens."
                )

    @staticmethod
    def _usage_value(usage: object, field_name: str) -> int:
        """Return non-negative integer from usage metadata."""
        value = getattr(usage, field_name, 0)
        if isinstance(value, int):
            return max(0, value)
        return 0

    @staticmethod
    def _extract_text(response: object) -> str:
        """Extract text from Gemini generate_content response."""
        text = getattr(response, "text", None)
        if isinstance(text, str) and text.strip():
            return text.strip()
        candidates = getattr(response, "candidates", None)
        if candidates and len(candidates) > 0:
            content = getattr(candidates[0], "content", None)
            if content:
                parts = getattr(content, "parts", [])
                for part in parts:
                    part_text = getattr(part, "text", None)
                    if isinstance(part_text, str) and part_text.strip():
                        return part_text.strip()
        raise ValueError("LLM response did not include text content.")

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
