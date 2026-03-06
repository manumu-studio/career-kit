"""Tests for backend health endpoint."""

import os

from fastapi.testclient import TestClient

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from app.main import app


def test_health_endpoint_returns_ok() -> None:
    """Ensures health endpoint responds with success payload."""
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert "version" in data
    assert data["database"] in ("connected", "disconnected")
    assert "timestamp" in data
    assert "uptime_seconds" in data
