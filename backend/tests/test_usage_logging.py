"""Tests for usage metrics, usage logging, and Anthropic usage extraction."""

from __future__ import annotations

import logging
import os

import pytest
from pydantic import ValidationError

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from app.core.usage_logger import UsageLogger, calculate_estimated_cost
from app.models.schemas import OptimizationResult, UsageMetrics
from app.services.llm.anthropic import AnthropicProvider


def test_cost_calculation() -> None:
    """Estimated cost should match token-volume pricing formula."""
    cost = calculate_estimated_cost(
        input_tokens=250_000,
        output_tokens=100_000,
        input_cost_per_million=0.8,
        output_cost_per_million=4.0,
    )
    assert cost == pytest.approx(0.6, rel=1e-9)


def test_usage_metrics_model() -> None:
    """UsageMetrics should validate and reject negative token values."""
    metrics = UsageMetrics(
        input_tokens=100,
        output_tokens=50,
        total_tokens=150,
        estimated_cost_usd=0.0003,
        model="claude-haiku-4-5-20251001",
        provider="anthropic",
    )
    assert metrics.total_tokens == 150

    with pytest.raises(ValidationError):
        UsageMetrics(
            input_tokens=-1,
            output_tokens=50,
            total_tokens=49,
            estimated_cost_usd=0.0001,
            model="claude-haiku-4-5-20251001",
            provider="anthropic",
        )


@pytest.mark.asyncio
async def test_log_output_format(
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """A provider optimize call should emit a structured [USAGE] log line."""

    class _MockTextBlock:
        def __init__(self, text: str) -> None:
            self.text = text

    class _MockUsage:
        def __init__(self, input_tokens: int, output_tokens: int) -> None:
            self.input_tokens = input_tokens
            self.output_tokens = output_tokens

    class _MockResponse:
        def __init__(self) -> None:
            self.usage = _MockUsage(input_tokens=1234, output_tokens=567)
            self.content = [
                _MockTextBlock(
                    '{"sections":[],"gap_analysis":[],"keyword_matches":[],"keyword_misses":[],"match_score":75,"summary":"ok"}'
                )
            ]

    provider = AnthropicProvider()

    async def _mock_create(**kwargs: object) -> _MockResponse:  # noqa: ARG001
        return _MockResponse()

    monkeypatch.setattr(provider._client.messages, "create", _mock_create)

    caplog.set_level(logging.INFO, logger="ats.usage")
    result = await provider.optimize("CV text", "JD text")

    assert isinstance(result, OptimizationResult)
    usage_logs = [
        record.getMessage()
        for record in caplog.records
        if record.name == "ats.usage" and "[USAGE]" in record.getMessage()
    ]
    assert usage_logs
    assert "model=claude-haiku-4-5-20251001" in usage_logs[0]
    assert "provider=anthropic" in usage_logs[0]
    assert "input=1234" in usage_logs[0]
    assert "output=567" in usage_logs[0]
    assert "total=1801" in usage_logs[0]
    assert "cost=$" in usage_logs[0]


def test_running_totals() -> None:
    """Logger totals should accumulate requests, tokens, and estimated cost."""
    logger = UsageLogger()
    logger.log(
        UsageMetrics(
            input_tokens=100,
            output_tokens=25,
            total_tokens=125,
            estimated_cost_usd=0.001,
            model="claude-haiku-4-5-20251001",
            provider="anthropic",
        )
    )
    logger.log(
        UsageMetrics(
            input_tokens=50,
            output_tokens=75,
            total_tokens=125,
            estimated_cost_usd=0.002,
            model="claude-haiku-4-5-20251001",
            provider="anthropic",
        )
    )

    summary = logger.get_usage_summary()
    assert summary["total_requests"] == 2
    assert summary["total_input_tokens"] == 150
    assert summary["total_output_tokens"] == 100
    assert summary["total_estimated_cost"] == pytest.approx(0.003, rel=1e-9)


def test_running_totals_reset() -> None:
    """A fresh UsageLogger instance should start with zeroed totals."""
    logger = UsageLogger()
    summary = logger.get_usage_summary()
    assert summary["total_requests"] == 0
    assert summary["total_input_tokens"] == 0
    assert summary["total_output_tokens"] == 0
    assert summary["total_estimated_cost"] == 0.0
