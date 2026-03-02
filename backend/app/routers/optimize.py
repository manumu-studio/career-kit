"""CV optimization endpoint with optional company-aware tailoring context."""

import json
from typing import Annotated, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app.core.config import settings
from app.models.schemas import CompanyProfile, ErrorResponse, OptimizationResult
from app.services.llm.factory import get_provider
from app.services.pdf_parser import extract_text_from_pdf

router = APIRouter(tags=["optimize"])


@router.post(
    "/optimize",
    response_model=OptimizationResult,
    responses={500: {"model": ErrorResponse}},
)
async def optimize_cv(
    cv_file: Annotated[UploadFile, File(...)],
    job_description: Annotated[str, Form(...)],
    company_name: Annotated[Optional[str], Form()] = None,  # noqa: UP045
    company_profile_json: Annotated[Optional[str], Form()] = None,  # noqa: UP045
) -> OptimizationResult:
    """Parse CV and invoke the configured LLM provider."""
    filename = cv_file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a PDF.")

    try:
        cv_text = await extract_text_from_pdf(cv_file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        provider = get_provider(settings.llm_provider)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    try:
        company_context: Optional[CompanyProfile] = None  # noqa: UP045
        if company_profile_json:
            raw_context = json.loads(company_profile_json)
            company_context = CompanyProfile.model_validate(raw_context)

        return await provider.optimize(
            cv_text=cv_text,
            job_description=job_description,
            company_name=company_name,
            company_context=company_context,
        )
    except (json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid company context payload: {exc}",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse LLM response: {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="LLM provider request failed.",
        ) from exc
