"""FastAPI application entrypoint and middleware setup."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.optimize import router as optimize_router

app = FastAPI(title="ATS Career Kit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(optimize_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Returns service health status for uptime checks."""
    return {"status": "ok"}
