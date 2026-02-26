"""Anthropic Claude implementation of the LLM provider interface."""

from __future__ import annotations

import json
import re

from anthropic import AsyncAnthropic

from app.core.config import get_settings
from app.core.prompts import build_system_prompt, build_user_prompt
from app.core.usage_logger import calculate_estimated_cost, usage_logger
from app.models.schemas import OptimizationResult, UsageMetrics
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

    async def optimize(self, cv_text: str, job_description: str) -> OptimizationResult:
        """Generate and validate ATS optimization output."""
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=4096,
            system=build_system_prompt(),
            messages=[
                {
                    "role": "user",
                    "content": build_user_prompt(
                        cv_text=cv_text, job_description=job_description
                    ),
                }
            ],
        )
        self._log_usage(response)

        raw_text = self._extract_text_content(response.content)
        cleaned_text = self._strip_markdown_fences(raw_text)

        try:
            payload = json.loads(cleaned_text)
        except json.JSONDecodeError as exc:
            raise ValueError("LLM returned non-JSON output.") from exc

        return OptimizationResult.model_validate(payload)

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
