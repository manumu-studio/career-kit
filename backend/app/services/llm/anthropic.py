"""Anthropic Claude implementation of the LLM provider interface."""

from __future__ import annotations

import json
import re
from typing import Optional

from anthropic import AsyncAnthropic

from app.core.config import get_settings
from app.core.prompts import (
    build_company_system_prompt,
    build_company_user_prompt,
    build_system_prompt,
    build_user_prompt,
)
from app.core.usage_logger import calculate_estimated_cost, usage_logger
from app.models.schemas import (
    CompanyProfile,
    CompanyResearchResult,
    OptimizationResult,
    UsageMetrics,
)
from app.services.llm.base import LLMProvider


class AnthropicProvider(LLMProvider):
    """Claude implementation using the Anthropic SDK."""

    def __init__(self) -> None:
        """Initialize provider with API client and model name."""
        settings = get_settings()
        self._client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        self._model = "claude-haiku-4-5-20251001"
        self._input_cost_per_million = settings.llm_input_cost_per_million
        self._output_cost_per_million = settings.llm_output_cost_per_million

    async def optimize(
        self,
        cv_text: str,
        job_description: str,
        company_name: Optional[str] = None,  # noqa: UP045
        company_context: Optional[CompanyProfile] = None,  # noqa: UP045
    ) -> OptimizationResult:
        """Generate and validate CV optimization output."""
        system = build_system_prompt()
        user_prompt = build_user_prompt(
            cv_text=cv_text,
            job_description=job_description,
            company_name=company_name,
            company_context=company_context,
        )
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=8192,
            system=system,
            messages=[{"role": "user", "content": user_prompt}],
        )
        self._log_usage(response)
        self._check_stop_reason(response, "optimize")

        raw_text = self._extract_text_content(response.content)
        cleaned_text = self._strip_markdown_fences(raw_text)

        payload = self._load_json_object(cleaned_text)
        if payload is not None:
            return OptimizationResult.model_validate(payload)

        # Retry once with explicit JSON correction request.
        retry_response = await self._client.messages.create(
            model=self._model,
            max_tokens=8192,
            system=system,
            messages=[
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
        )
        self._log_usage(retry_response)
        self._check_stop_reason(retry_response, "optimize retry")

        retry_text = self._extract_text_content(retry_response.content)
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
        job_title: Optional[str] = None,  # noqa: UP045
    ) -> CompanyResearchResult:
        """Generate and validate structured company research output."""
        user_prompt = build_company_user_prompt(
            company_name=company_name,
            job_title=job_title or "Not specified",
            website_content=website_content,
            search_results=search_results,
        )
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=4096,
            system=build_company_system_prompt(),
            messages=[{"role": "user", "content": user_prompt}],
        )
        self._log_usage(response)
        self._check_stop_reason(response, "synthesize_company")

        raw_text = self._extract_text_content(response.content)
        cleaned_text = self._strip_markdown_fences(raw_text)
        payload = self._load_json_object(cleaned_text)
        if payload is not None:
            return CompanyResearchResult.model_validate(payload)

        # Retry once with explicit JSON correction request.
        retry_response = await self._client.messages.create(
            model=self._model,
            max_tokens=4096,
            system=build_company_system_prompt(),
            messages=[
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
        )
        self._log_usage(retry_response)
        self._check_stop_reason(retry_response, "synthesize_company retry")
        retry_text = self._extract_text_content(retry_response.content)
        retry_cleaned = self._strip_markdown_fences(retry_text)
        retry_payload = self._load_json_object(retry_cleaned)
        if retry_payload is None:
            raise ValueError("LLM returned non-JSON output after retry.")
        return CompanyResearchResult.model_validate(retry_payload)

    def _log_usage(self, response: object) -> None:
        """Extract usage counters from Anthropic response and emit usage log."""
        usage = getattr(response, "usage", None)
        input_tokens = self._usage_token_value(usage, "input_tokens")
        output_tokens = self._usage_token_value(usage, "output_tokens")
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
                provider="anthropic",
            )
        )

    @staticmethod
    def _check_stop_reason(response: object, context: str) -> None:
        """Raise immediately when the response was truncated at the token limit."""
        stop_reason = getattr(response, "stop_reason", None)
        if stop_reason == "max_tokens":
            raise ValueError(
                f"LLM response truncated at token limit during {context}. "
                "Reduce input size or increase max_tokens."
            )

    @staticmethod
    def _usage_token_value(usage: object, field_name: str) -> int:
        """Return non-negative integer usage values from provider response."""
        value = getattr(usage, field_name, 0)
        if isinstance(value, int):
            return max(0, value)
        return 0

    @staticmethod
    def _extract_text_content(content_blocks: object) -> str:
        """Extract plain text from Anthropic content blocks."""
        if not isinstance(content_blocks, list):
            raise ValueError("Unexpected response format from Anthropic API.")

        text_parts: list[str] = []
        for block in content_blocks:
            block_text = getattr(block, "text", None)
            if isinstance(block_text, str) and block_text.strip():
                text_parts.append(block_text)

        if not text_parts:
            raise ValueError("LLM response did not include text content.")

        return "\n".join(text_parts).strip()

    @staticmethod
    def _strip_markdown_fences(value: str) -> str:
        """Remove leading/trailing markdown code fences if present."""
        stripped = value.strip()
        fence_match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", stripped, re.DOTALL)
        if fence_match:
            return fence_match.group(1).strip()
        return stripped

    @staticmethod
    def _load_json_object(raw_text: str) -> Optional[dict[str, object]]:  # noqa: UP045
        """Attempt JSON parsing and return dictionary payload when valid."""
        try:
            payload = json.loads(raw_text)
        except json.JSONDecodeError:
            return None
        if isinstance(payload, dict):
            return payload
        return None
