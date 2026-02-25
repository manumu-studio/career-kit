"""CV optimization endpoint."""

from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import settings
from app.models.schemas import ErrorResponse, OptimizationResult
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
        return await provider.optimize(cv_text=cv_text, job_description=job_description)
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
