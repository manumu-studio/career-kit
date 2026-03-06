"""Health check endpoint for uptime monitoring and load balancer probes."""

import time
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import text

from app.core.config import settings
from app.models.database import async_session_maker

router = APIRouter(tags=["health"])

_APP_START_TIME: float = time.monotonic()


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str
    version: str
    database: str
    timestamp: str
    uptime_seconds: float


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Returns service health status for uptime checks and load balancers."""
    uptime_seconds = time.monotonic() - _APP_START_TIME
    timestamp = datetime.now(timezone.utc).isoformat()

    database_status = "disconnected"
    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
            database_status = "connected"
    except Exception:
        pass

    status = "healthy" if database_status == "connected" else "degraded"

    return HealthResponse(
        status=status,
        version=settings.app_version,
        database=database_status,
        timestamp=timestamp,
        uptime_seconds=round(uptime_seconds, 2),
    )
