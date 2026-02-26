"""In-memory per-IP rate limiting middleware for optimize requests."""

from __future__ import annotations

import asyncio
import math
import time
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from starlette.types import ASGIApp


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Apply a fixed-window request limit for the /optimize route."""

    def __init__(
        self,
        app: ASGIApp,
        rate_limit_requests: int,
        rate_limit_window_seconds: int,
        time_provider: Callable[[], float] | None = None,
    ) -> None:
        """Store rate limit settings and initialize thread-safe in-memory storage."""
        super().__init__(app)
        self._rate_limit_requests = rate_limit_requests
        self._rate_limit_window_seconds = rate_limit_window_seconds
        self._time_provider = time_provider or time.monotonic
        self._requests_by_ip: dict[str, list[float]] = {}
        self._lock = asyncio.Lock()

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        """Rate limit /optimize requests and pass through all other routes."""
        if request.url.path != "/optimize":
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        current_time = self._time_provider()

        async with self._lock:
            threshold = current_time - self._rate_limit_window_seconds
            self._prune_stale_entries(threshold)

            recent_requests = [
                timestamp
                for timestamp in self._requests_by_ip.get(client_ip, [])
                if timestamp > threshold
            ]

            if len(recent_requests) >= self._rate_limit_requests:
                retry_after_seconds = self._retry_after_seconds(
                    oldest_timestamp=min(recent_requests),
                    current_time=current_time,
                )
                return self._build_rate_limited_response(retry_after_seconds)

            recent_requests.append(current_time)
            self._requests_by_ip[client_ip] = recent_requests

        return await call_next(request)

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request metadata with a deterministic fallback."""
        if request.client is None or request.client.host is None:
            return "unknown"
        return request.client.host

    def _prune_stale_entries(self, threshold: float) -> None:
        """Drop expired timestamps and remove empty IP buckets on every request."""
        stale_ips: list[str] = []
        for ip, timestamps in self._requests_by_ip.items():
            recent = [timestamp for timestamp in timestamps if timestamp > threshold]
            if recent:
                self._requests_by_ip[ip] = recent
            else:
                stale_ips.append(ip)

        for ip in stale_ips:
            del self._requests_by_ip[ip]

    def _retry_after_seconds(self, oldest_timestamp: float, current_time: float) -> int:
        """Compute positive Retry-After seconds until next request is allowed."""
        remaining = oldest_timestamp + self._rate_limit_window_seconds - current_time
        return max(1, math.ceil(remaining))

    def _build_rate_limited_response(self, retry_after_seconds: int) -> JSONResponse:
        """Create the standardized 429 response body and header."""
        return JSONResponse(
            status_code=429,
            content={
                "detail": (
                    f"Rate limit exceeded. Try again in {retry_after_seconds} seconds."
                )
            },
            headers={"Retry-After": str(retry_after_seconds)},
        )
