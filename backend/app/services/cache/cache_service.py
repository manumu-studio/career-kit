"""Cache service for research and optimization result lookups and storage."""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import AnalysisHistory
from app.services.cache.hash_utils import hash_job_description, hash_url

RESEARCH_CACHE_TTL_DAYS = 14
OPTIMIZATION_CACHE_TTL_DAYS = 30


class CacheService:
    """Handles cache lookups and storage for research and optimization results."""

    def __init__(self, db: AsyncSession) -> None:
        """Initialize with an async database session."""
        self._db = db

    async def check_research_cache(
        self, user_id: str, company_url: str
    ) -> Optional[AnalysisHistory]:
        """Return cached research if match exists and not expired, else None."""
        url_hash = hash_url(company_url)
        result = await self._db.execute(
            select(AnalysisHistory)
            .where(AnalysisHistory.user_id == user_id)
            .where(AnalysisHistory.company_url_hash == url_hash)
            .where(AnalysisHistory.analysis_type.in_(["research", "both"]))
            .where(AnalysisHistory.expires_at > datetime.now(timezone.utc))
            .order_by(AnalysisHistory.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def check_optimization_cache(
        self,
        user_id: str,
        job_description: str,
        company_url: Optional[str] = None,
    ) -> Optional[AnalysisHistory]:
        """Return cached optimization if match exists and not expired, else None."""
        jd_hash = hash_job_description(job_description)
        company_hash = hash_url(company_url) if company_url else None

        query = (
            select(AnalysisHistory)
            .where(AnalysisHistory.user_id == user_id)
            .where(AnalysisHistory.jd_hash == jd_hash)
            .where(AnalysisHistory.analysis_type.in_(["optimize", "both"]))
            .where(AnalysisHistory.expires_at > datetime.now(timezone.utc))
        )
        if company_hash is not None:
            query = query.where(AnalysisHistory.company_url_hash == company_hash)
        query = query.order_by(AnalysisHistory.created_at.desc()).limit(1)
        result = await self._db.execute(query)
        return result.scalar_one_or_none()

    async def store_research_result(
        self,
        user_id: str,
        company_url: str,
        company_name: Optional[str],
        result: dict[str, Any],
        llm_model: str,
        cost_usd: float,
    ) -> AnalysisHistory:
        """Create and persist a new research analysis row."""
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=RESEARCH_CACHE_TTL_DAYS
        )
        row = AnalysisHistory(
            user_id=user_id,
            analysis_type="research",
            expires_at=expires_at,
            company_url_hash=hash_url(company_url),
            company_name=company_name,
            company_research_json=result,
            llm_model=llm_model,
            total_cost_usd=cost_usd,
            cache_hit=False,
        )
        self._db.add(row)
        await self._db.flush()
        await self._db.refresh(row)
        return row

    async def store_optimization_result(
        self,
        user_id: str,
        job_description: str,
        company_url: Optional[str],
        company_name: Optional[str],
        job_title: Optional[str],
        cv_filename: Optional[str],
        result: dict[str, Any],
        llm_model: str,
        cost_usd: float,
    ) -> AnalysisHistory:
        """Create and persist a new optimization analysis row."""
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=OPTIMIZATION_CACHE_TTL_DAYS
        )
        row = AnalysisHistory(
            user_id=user_id,
            analysis_type="optimize",
            expires_at=expires_at,
            jd_hash=hash_job_description(job_description),
            company_url_hash=hash_url(company_url) if company_url else None,
            company_name=company_name,
            job_title=job_title,
            job_description_preview=job_description[:500].strip(),
            cv_filename=cv_filename,
            optimization_result_json=result,
            llm_model=llm_model,
            total_cost_usd=cost_usd,
            cache_hit=False,
        )
        self._db.add(row)
        await self._db.flush()
        await self._db.refresh(row)
        return row

    async def record_cache_hit(
        self, user_id: str, source_analysis: AnalysisHistory
    ) -> AnalysisHistory:
        """Create a new row linked to cache hit source (no LLM cost)."""
        row = AnalysisHistory(
            user_id=user_id,
            analysis_type=source_analysis.analysis_type,
            expires_at=source_analysis.expires_at,
            company_url_hash=source_analysis.company_url_hash,
            jd_hash=source_analysis.jd_hash,
            company_name=source_analysis.company_name,
            job_title=source_analysis.job_title,
            job_description_preview=source_analysis.job_description_preview,
            cv_filename=source_analysis.cv_filename,
            company_research_json=source_analysis.company_research_json,
            optimization_result_json=source_analysis.optimization_result_json,
            llm_model=source_analysis.llm_model,
            total_cost_usd=0.0,
            cache_hit=True,
            source_analysis_id=source_analysis.id,
        )
        self._db.add(row)
        await self._db.flush()
        await self._db.refresh(row)
        return row
