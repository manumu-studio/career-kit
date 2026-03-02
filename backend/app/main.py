"""FastAPI application entrypoint and middleware setup."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.middleware.rate_limit import RateLimitMiddleware
from app.routers.optimize import router as optimize_router
from app.routers.research import router as research_router

app = FastAPI(title="ATS Career Kit API")

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

app.include_router(optimize_router)
app.include_router(research_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Returns service health status for uptime checks."""
    return {"status": "ok"}
