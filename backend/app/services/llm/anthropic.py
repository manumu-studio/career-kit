"""Anthropic Claude implementation of the LLM provider interface."""

from __future__ import annotations

import json
import re

from anthropic import AsyncAnthropic

from app.core.config import get_settings
from app.core.prompts import build_system_prompt, build_user_prompt
from app.models.schemas import OptimizationResult
from app.services.llm.base import LLMProvider


class AnthropicProvider(LLMProvider):
    """Claude implementation using the Anthropic SDK."""

    def __init__(self) -> None:
        """Initialize provider with API client and model name."""
        settings = get_settings()
        self._client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        self._model = "claude-haiku-4-5-20251001"

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

        raw_text = self._extract_text_content(response.content)
        cleaned_text = self._strip_markdown_fences(raw_text)

        try:
            payload = json.loads(cleaned_text)
        except json.JSONDecodeError as exc:
            raise ValueError("LLM returned non-JSON output.") from exc

        return OptimizationResult.model_validate(payload)

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
