"""Structured usage logging and in-memory totals for LLM requests."""

from __future__ import annotations

import logging
from typing import TypedDict

from app.models.schemas import UsageMetrics


class UsageSummary(TypedDict):
    """Aggregated usage totals for current process lifetime."""

    total_requests: int
    total_input_tokens: int
    total_output_tokens: int
    total_estimated_cost: float


def calculate_estimated_cost(
    input_tokens: int,
    output_tokens: int,
    input_cost_per_million: float,
    output_cost_per_million: float,
) -> float:
    """Compute estimated USD cost from token counts and per-million pricing."""
    input_cost = (input_tokens / 1_000_000) * input_cost_per_million
    output_cost = (output_tokens / 1_000_000) * output_cost_per_million
    return input_cost + output_cost


class UsageLogger:
    """Collect usage metrics and emit structured usage log lines."""

    def __init__(self) -> None:
        """Initialize logger and process-lifetime running totals."""
        self._logger = logging.getLogger("ats.usage")
        self._total_requests = 0
        self._total_input_tokens = 0
        self._total_output_tokens = 0
        self._total_estimated_cost = 0.0

    def log(self, metrics: UsageMetrics) -> None:
        """Log one usage event and update cumulative process totals."""
        self._total_requests += 1
        self._total_input_tokens += metrics.input_tokens
        self._total_output_tokens += metrics.output_tokens
        self._total_estimated_cost += metrics.estimated_cost_usd

        self._logger.info(
            "[USAGE] model=%s provider=%s input=%d output=%d total=%d cost=$%.6f",
            metrics.model,
            metrics.provider,
            metrics.input_tokens,
            metrics.output_tokens,
            metrics.total_tokens,
            metrics.estimated_cost_usd,
        )

    def get_usage_summary(self) -> UsageSummary:
        """Return cumulative in-memory totals for current process."""
        return {
            "total_requests": self._total_requests,
            "total_input_tokens": self._total_input_tokens,
            "total_output_tokens": self._total_output_tokens,
            "total_estimated_cost": self._total_estimated_cost,
        }


usage_logger = UsageLogger()


def get_usage_summary() -> UsageSummary:
    """Expose usage summary for future admin/reporting integrations."""
    return usage_logger.get_usage_summary()
