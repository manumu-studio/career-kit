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
    assert response.json() == {"status": "ok"}
