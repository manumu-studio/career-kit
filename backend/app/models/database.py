"""SQLAlchemy 2.0 async engine, session factory, Base, and AnalysisHistory model."""

import uuid
from collections.abc import AsyncGenerator
from datetime import datetime
from typing import Any, Dict, Optional
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, String, func, select
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.core.config import settings


def _normalize_asyncpg_url(url: str) -> str:
    """Convert psycopg params (sslmode, channel_binding) to asyncpg (ssl)."""
    parsed = urlparse(url)
    if not parsed.query:
        return url
    params = parse_qs(parsed.query, keep_blank_values=True)
    if "sslmode" in params or "channel_binding" in params:
        params.pop("sslmode", None)
        params.pop("channel_binding", None)
        if "ssl" not in params:
            params["ssl"] = ["require"]
        new_query = urlencode(params, doseq=True)
        return urlunparse(parsed._replace(query=new_query))
    return url


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""

    pass


engine = create_async_engine(
    _normalize_asyncpg_url(settings.database_url),
    echo=False,
)
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async database session."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_optional() -> AsyncGenerator[Optional[AsyncSession], None]:
    """Yields a DB session when available, or None when the database is unreachable."""
    try:
        async with async_session_maker() as session:
            try:
                await session.execute(select(1))
            except BaseException:
                yield None
                return
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    except BaseException:
        yield None
        return


class AnalysisHistory(Base):
    """Stores every research + optimization run per user."""

    __tablename__ = "analysis_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    analysis_type: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    # Cache keys (for exact match detection)
    company_url_hash: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True, index=True
    )
    jd_hash: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True, index=True
    )
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    job_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Input snapshots (for history display, not for cache matching)
    job_description_preview: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    cv_filename: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Stored results (JSON)
    company_research_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True
    )
    optimization_result_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True
    )

    # Metadata
    llm_model: Mapped[str] = mapped_column(String(100), nullable=False)
    total_cost_usd: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    cache_hit: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    source_analysis_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysis_history.id"),
        nullable=True,
    )

    __table_args__ = (
        Index("ix_analysis_history_user_company", "user_id", "company_url_hash"),
        Index("ix_analysis_history_user_jd", "user_id", "jd_hash"),
    )

    def __repr__(self) -> str:
        """Return a string representation for debugging."""
        return (
            f"<AnalysisHistory(id={self.id!r}, user_id={self.user_id!r}, "
            f"analysis_type={self.analysis_type!r}, created_at={self.created_at!r})>"
        )
