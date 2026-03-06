"""History CRUD endpoints for user analyses with pagination and filters."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated, Literal, Optional
from typing import cast as typing_cast
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Integer, cast, delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_user_id
from app.models.database import AnalysisHistory, get_db_optional
from app.models.schemas import (
    CachedMatchInfo,
    CheckCacheResponse,
    CheckOptimizationRequest,
    CheckResearchRequest,
    ErrorResponse,
    HistoryDetailResponse,
    HistoryListItem,
    HistoryListResponse,
    HistoryStatsResponse,
)
from app.services.cache import CacheService

router = APIRouter(prefix="/history", tags=["history"])


def _row_to_list_item(row: AnalysisHistory) -> HistoryListItem:
    """Convert AnalysisHistory row to HistoryListItem schema."""
    match_score: Optional[int] = None
    if row.optimization_result_json and isinstance(row.optimization_result_json, dict):
        match_score = row.optimization_result_json.get("match_score")

    at: Literal["research", "optimize", "both"] = typing_cast(
        Literal["research", "optimize", "both"], row.analysis_type
    )
    return HistoryListItem(
        id=str(row.id),
        analysis_type=at,
        company_name=row.company_name,
        job_title=row.job_title,
        job_description_preview=row.job_description_preview,
        cv_filename=row.cv_filename,
        created_at=row.created_at.isoformat(),
        expires_at=row.expires_at.isoformat(),
        cache_hit=row.cache_hit,
        match_score=match_score,
    )


@router.get(
    "/stats",
    response_model=HistoryStatsResponse,
    responses={500: {"model": ErrorResponse}},
)
async def get_history_stats(
    db: Annotated[Optional[AsyncSession], Depends(get_db_optional)],
    user_id: Annotated[str, Depends(get_user_id)],
) -> HistoryStatsResponse:
    """Return usage stats: total analyses, cache hits, total cost."""
    if db is None:
        return HistoryStatsResponse(
            total_analyses=0,
            cache_hits=0,
            total_cost_usd=0.0,
        )
    result = await db.execute(
        select(
            func.count(AnalysisHistory.id).label("total"),
            func.sum(cast(AnalysisHistory.cache_hit, Integer)).label("cache_hits"),
            func.coalesce(func.sum(AnalysisHistory.total_cost_usd), 0).label("cost"),
        ).where(AnalysisHistory.user_id == user_id)
    )
    row = result.one()
    cache_hits_val = row.cache_hits or 0
    return HistoryStatsResponse(
        total_analyses=row.total or 0,
        cache_hits=int(cache_hits_val),
        total_cost_usd=float(row.cost or 0),
    )


@router.get(
    "",
    response_model=HistoryListResponse,
    responses={500: {"model": ErrorResponse}},
)
async def list_history(
    db: Annotated[Optional[AsyncSession], Depends(get_db_optional)],
    user_id: Annotated[str, Depends(get_user_id)],
    type_filter: Annotated[
        Optional[Literal["research", "optimize", "both"]],
        Query(alias="type"),
    ] = None,
    company: Annotated[Optional[str], Query()] = None,
    from_date: Annotated[Optional[str], Query(alias="from")] = None,
    to_date: Annotated[Optional[str], Query(alias="to")] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> HistoryListResponse:
    """List user analyses with pagination and filters. Newest first."""
    if db is None:
        return HistoryListResponse(items=[], total=0, page=page, limit=limit)
    query = select(AnalysisHistory).where(AnalysisHistory.user_id == user_id)

    if type_filter:
        if type_filter == "both":
            query = query.where(AnalysisHistory.analysis_type == "both")
        else:
            query = query.where(AnalysisHistory.analysis_type == type_filter)

    if company:
        query = query.where(
            func.lower(AnalysisHistory.company_name).contains(company.lower())
        )

    if from_date:
        try:
            dt = datetime.fromisoformat(from_date.replace("Z", "+00:00"))
            query = query.where(AnalysisHistory.created_at >= dt)
        except ValueError:
            pass

    if to_date:
        try:
            dt = datetime.fromisoformat(to_date.replace("Z", "+00:00"))
            query = query.where(AnalysisHistory.created_at <= dt)
        except ValueError:
            pass

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(AnalysisHistory.created_at.desc())
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    rows = result.scalars().all()

    items = [_row_to_list_item(r) for r in rows]
    return HistoryListResponse(items=items, total=total, page=page, limit=limit)


@router.post(
    "/check-research",
    response_model=CheckCacheResponse,
    responses={500: {"model": ErrorResponse}},
)
async def check_research_cache(
    body: CheckResearchRequest,
    db: Annotated[Optional[AsyncSession], Depends(get_db_optional)],
    user_id: Annotated[str, Depends(get_user_id)],
) -> CheckCacheResponse:
    """Check if cached research exists for the given company URL."""
    if not body.company_url.strip() or db is None:
        return CheckCacheResponse(cached=False)
    try:
        cache_service = CacheService(db)
        cached = await cache_service.check_research_cache(
            user_id=user_id,
            company_url=body.company_url.strip(),
        )
        if not cached:
            return CheckCacheResponse(cached=False)
        return CheckCacheResponse(
            cached=True,
            match=CachedMatchInfo(
                analysis_id=str(cached.id),
                company_name=cached.company_name,
                job_title=cached.job_title,
                created_at=cached.created_at.isoformat(),
            ),
        )
    except Exception:
        return CheckCacheResponse(cached=False)


@router.post(
    "/check-optimization",
    response_model=CheckCacheResponse,
    responses={500: {"model": ErrorResponse}},
)
async def check_optimization_cache(
    body: CheckOptimizationRequest,
    db: Annotated[Optional[AsyncSession], Depends(get_db_optional)],
    user_id: Annotated[str, Depends(get_user_id)],
) -> CheckCacheResponse:
    """Check if cached optimization exists for the given JD and optional company URL."""
    if not body.job_description.strip() or db is None:
        return CheckCacheResponse(cached=False)
    try:
        cache_service = CacheService(db)
        cached = await cache_service.check_optimization_cache(
            user_id=user_id,
            job_description=body.job_description.strip(),
            company_url=body.company_url.strip() if body.company_url else None,
        )
        if not cached:
            return CheckCacheResponse(cached=False)
        return CheckCacheResponse(
            cached=True,
            match=CachedMatchInfo(
                analysis_id=str(cached.id),
                company_name=cached.company_name,
                job_title=cached.job_title,
                created_at=cached.created_at.isoformat(),
            ),
        )
    except Exception:
        return CheckCacheResponse(cached=False)


@router.get(
    "/{analysis_id}",
    response_model=HistoryDetailResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def get_history_detail(
    analysis_id: UUID,
    db: Annotated[Optional[AsyncSession], Depends(get_db_optional)],
    user_id: Annotated[str, Depends(get_user_id)],
) -> HistoryDetailResponse:
    """Get full analysis detail by ID."""
    if db is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    result = await db.execute(
        select(AnalysisHistory)
        .where(AnalysisHistory.id == analysis_id)
        .where(AnalysisHistory.user_id == user_id)
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    at: Literal["research", "optimize", "both"] = typing_cast(
        Literal["research", "optimize", "both"], row.analysis_type
    )
    return HistoryDetailResponse(
        id=str(row.id),
        analysis_type=at,
        company_name=row.company_name,
        job_title=row.job_title,
        job_description_preview=row.job_description_preview,
        cv_filename=row.cv_filename,
        created_at=row.created_at.isoformat(),
        expires_at=row.expires_at.isoformat(),
        cache_hit=row.cache_hit,
        company_research_json=row.company_research_json,
        optimization_result_json=row.optimization_result_json,
    )


@router.delete(
    "/{analysis_id}",
    status_code=204,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def delete_history_entry(
    analysis_id: UUID,
    db: Annotated[Optional[AsyncSession], Depends(get_db_optional)],
    user_id: Annotated[str, Depends(get_user_id)],
) -> None:
    """Delete a single analysis by ID."""
    if db is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    result = await db.execute(
        select(AnalysisHistory)
        .where(AnalysisHistory.id == analysis_id)
        .where(AnalysisHistory.user_id == user_id)
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    await db.delete(row)


@router.delete(
    "",
    status_code=204,
    responses={500: {"model": ErrorResponse}},
)
async def clear_all_history(
    db: Annotated[Optional[AsyncSession], Depends(get_db_optional)],
    user_id: Annotated[str, Depends(get_user_id)],
) -> None:
    """Clear all analyses for the current user."""
    if db is not None:
        stmt = delete(AnalysisHistory).where(AnalysisHistory.user_id == user_id)
        await db.execute(stmt)
