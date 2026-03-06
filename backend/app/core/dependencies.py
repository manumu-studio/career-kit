"""FastAPI dependencies for request-scoped values."""

from fastapi import Header


async def get_user_id(x_user_id: str = Header(default="anonymous")) -> str:
    """Extract user ID from X-User-Id header. Default 'anonymous' for local dev."""
    return x_user_id
