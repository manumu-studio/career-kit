"""FastAPI application entrypoint and middleware setup."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.middleware.rate_limit import RateLimitMiddleware
from app.models.database import engine
from app.routers.cover_letter import router as cover_letter_router
from app.routers.health import router as health_router
from app.routers.history import router as history_router
from app.routers.optimize import router as optimize_router
from app.routers.providers import router as providers_router
from app.routers.research import router as research_router

logger = logging.getLogger(__name__)


def _cors_headers() -> dict[str, str]:
    """CORS headers so error responses are not blocked by browser."""
    origin = "http://localhost:3000"
    if settings.cors_origins:
        origin = settings.cors_origins[0]
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Return JSON response with explicit CORS headers so errors are not blocked."""
    headers = _cors_headers()
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=headers,
        )
    if isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors()},
            headers=headers,
        )
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers,
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application lifespan: startup and shutdown."""
    logger.info("Database engine connected")
    yield
    await engine.dispose()
    logger.info("Database engine disposed")


app = FastAPI(title="Career Kit API", lifespan=lifespan)

app.add_exception_handler(Exception, global_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    RateLimitMiddleware,
    rate_limit_requests=settings.rate_limit_requests,
    rate_limit_window_seconds=settings.rate_limit_window_seconds,
)

app.include_router(cover_letter_router)
app.include_router(health_router)
app.include_router(history_router)
app.include_router(optimize_router)
app.include_router(providers_router)
app.include_router(research_router)
