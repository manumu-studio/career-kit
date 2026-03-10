"""Cover letter generation endpoint."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import settings
from app.core.dependencies import get_user_id
from app.core.i18n import get_error_message, normalize_locale, resolve_language
from app.models.schemas import CoverLetterRequest, CoverLetterResult, ErrorResponse
from app.services.language_detector import detect_language
from app.services.llm.factory import get_provider

logger = logging.getLogger(__name__)
router = APIRouter(tags=["cover-letter"])


@router.post(
    "/cover-letter",
    response_model=CoverLetterResult,
    responses={422: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def generate_cover_letter(
    body: CoverLetterRequest,
    user_id: Annotated[str, Depends(get_user_id)],
) -> CoverLetterResult:
    """Generate cover letter from CV, job description, and company context."""
    _ = user_id
    fallback = normalize_locale(body.language)
    detected = detect_language(body.cv_text)
    loc = resolve_language(explicit=None, detected=detected, fallback=fallback)
    try:
        provider = get_provider(settings.llm_provider)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    try:
        result = await provider.generate_cover_letter(
            cv_text=body.cv_text,
            job_description=body.job_description,
            company_name=body.company_name,
            hiring_manager=body.hiring_manager,
            tone=body.tone,
            language=loc,
        )
        return result
    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail=get_error_message(loc, "llm_parse_failed", detail=str(exc)),
        ) from exc
    except Exception as exc:
        logger.exception("Cover letter generation failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=get_error_message(loc, "cover_letter_failed"),
        ) from exc
