"""CV optimization endpoint with optional company-aware tailoring context."""

import json
import logging
import re
from typing import Annotated, Literal, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_user_id
from app.core.i18n import get_error_message, normalize_locale
from app.models.database import get_db
from app.models.schemas import CompanyProfile, ErrorResponse, OptimizationResult
from app.services.cache import CacheService
from app.services.llm.factory import get_provider
from app.services.pdf_parser import extract_text_from_pdf

logger = logging.getLogger(__name__)
router = APIRouter(tags=["optimize"])


@router.post(
    "/optimize",
    response_model=OptimizationResult,
    responses={500: {"model": ErrorResponse}},
)
async def optimize_cv(
    cv_file: Annotated[UploadFile, File(...)],
    job_description: Annotated[str, Form(...)],
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[str, Depends(get_user_id)],
    company_name: Annotated[Optional[str], Form()] = None,  # noqa: UP045
    company_profile_json: Annotated[Optional[str], Form()] = None,  # noqa: UP045
    force_refresh: Annotated[bool, Form()] = False,
    provider: Annotated[Optional[str], Form()] = None,  # noqa: UP045
    language: Annotated[Optional[Literal["en", "es"]], Form()] = None,  # noqa: UP045
) -> OptimizationResult:
    """Parse CV and invoke the configured LLM provider."""
    loc = normalize_locale(language)
    filename = cv_file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail=get_error_message(loc, "invalid_pdf"),
        )

    try:
        cv_text = await extract_text_from_pdf(cv_file, locale=loc)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        llm_provider = get_provider(provider or settings.llm_provider)
    except ValueError as exc:
        err_msg = str(exc)
        if "Unknown provider" in err_msg:
            match = re.search(r"Unknown provider '([^']+)'\. Available: (.+)", err_msg)
            name = match.group(1) if match else "unknown"
            available = match.group(2) if match else "anthropic, openai, gemini"
            raise HTTPException(
                status_code=500,
                detail=get_error_message(
                    loc, "unknown_provider", name=name, available=available
                ),
            ) from exc
        raise HTTPException(status_code=500, detail=err_msg) from exc

    company_context: Optional[CompanyProfile] = None  # noqa: UP045
    if company_profile_json:
        try:
            raw_context = json.loads(company_profile_json)
            company_context = CompanyProfile.model_validate(raw_context)
        except (json.JSONDecodeError, ValidationError) as exc:
            raise HTTPException(
                status_code=400,
                detail=get_error_message(
                    loc, "invalid_company_context", detail=str(exc)
                ),
            ) from exc

    company_url: Optional[str] = None  # noqa: UP045
    if company_context and company_context.website:
        company_url = company_context.website

    if not force_refresh:
        try:
            cache_service = CacheService(db)
            cached = await cache_service.check_optimization_cache(
                user_id=user_id,
                job_description=job_description,
                company_url=company_url,
            )
            if cached and cached.optimization_result_json:
                await cache_service.record_cache_hit(user_id, cached)
                result = OptimizationResult(**cached.optimization_result_json)
                result.cache_hit = True
                result.cached_at = cached.created_at.isoformat()
                result.analysis_id = str(cached.id)
                return result
        except Exception as cache_err:
            logger.warning("Cache check failed: %s", cache_err)
            await db.rollback()

    try:
        result = await llm_provider.optimize(
            cv_text=cv_text,
            job_description=job_description,
            company_name=company_name,
            company_context=company_context,
            language=loc,
        )
        provider_name = provider or settings.llm_provider
        result.provider = provider_name
        result_dict = result.model_dump()
        try:
            stored = await cache_service.store_optimization_result(
                user_id=user_id,
                job_description=job_description,
                company_url=company_url,
                company_name=company_name,
                job_title=None,
                cv_filename=cv_file.filename,
                result=result_dict,
                llm_model=llm_provider.model_name,
                cost_usd=0.0,
            )
            result.analysis_id = str(stored.id)
        except Exception as store_err:
            logger.warning("Cache store failed: %s", store_err)
            await db.rollback()
        return result
    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail=get_error_message(loc, "llm_parse_failed", detail=str(exc)),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=get_error_message(loc, "llm_provider_failed"),
        ) from exc
