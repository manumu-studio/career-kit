"""Provider availability and comparison endpoints."""

import asyncio
import logging
import time
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import settings
from app.services.llm.factory import get_available_providers, get_provider
from app.services.pdf_parser import extract_text_from_pdf

logger = logging.getLogger(__name__)
router = APIRouter(tags=["providers"])


@router.get("/providers")
async def list_providers() -> dict[str, object]:
    """Return available providers (those with API keys configured) and default."""
    available = get_available_providers()
    return {
        "available": available,
        "default": settings.llm_provider,
    }


@router.post("/compare")
async def compare_providers(
    cv_file: Annotated[UploadFile, File(...)],
    job_description: Annotated[str, Form(...)],
    providers: Annotated[str, Form(...)],
) -> dict[str, object]:
    """Run optimize through multiple providers and return side-by-side results."""
    filename = cv_file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a PDF.")

    try:
        cv_text = await extract_text_from_pdf(cv_file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    provider_names = [p.strip() for p in providers.split(",") if p.strip()]
    if len(provider_names) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 providers required (e.g. anthropic,openai).",
        )

    available = set(get_available_providers())
    for name in provider_names:
        if name not in available:
            raise HTTPException(
                status_code=400,
                detail=f"Provider '{name}' is not available or not configured.",
            )

    async def run_provider(name: str) -> tuple[str, object, float]:
        """Run optimize for one provider and return (name, result, time_ms)."""
        start = time.monotonic()
        try:
            provider = get_provider(name)
            result = await provider.optimize(
                cv_text=cv_text,
                job_description=job_description,
            )
            elapsed_ms = (time.monotonic() - start) * 1000
            return (name, result.model_dump(), elapsed_ms)
        except Exception as exc:
            logger.exception("Provider %s failed: %s", name, exc)
            elapsed_ms = (time.monotonic() - start) * 1000
            return (name, {"error": str(exc)}, elapsed_ms)

    results_list = await asyncio.gather(
        *[run_provider(name) for name in provider_names]
    )

    results: dict[str, object] = {}
    processing_time_ms: dict[str, float] = {}
    score_delta: dict[str, int] = {}
    unique_keywords: dict[str, list[str]] = {}

    all_keywords: dict[str, set[str]] = {}
    for name, data, elapsed_ms in results_list:
        processing_time_ms[name] = round(elapsed_ms, 2)
        if isinstance(data, dict) and "error" in data:
            results[name] = data
        else:
            results[name] = data
            score = data.get("match_score", 0) if isinstance(data, dict) else 0
            score_delta[name] = score
            kw = data.get("keyword_matches", []) if isinstance(data, dict) else []
            all_keywords[name] = set(kw) if isinstance(kw, list) else set()

    for name in provider_names:
        others = set(provider_names) - {name}
        mine = all_keywords.get(name, set())
        unique = mine - set().union(*(all_keywords.get(o, set()) for o in others))
        unique_keywords[name] = sorted(unique)

    return {
        "results": results,
        "comparison": {
            "score_delta": score_delta,
            "unique_keywords": unique_keywords,
            "processing_time_ms": processing_time_ms,
        },
    }
