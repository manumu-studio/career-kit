"""Cache service for research and optimization result lookups and storage."""

from app.services.cache.cache_service import CacheService
from app.services.cache.hash_utils import (
    hash_job_description,
    hash_text,
    hash_url,
    normalize_url,
)

__all__ = [
    "CacheService",
    "hash_job_description",
    "hash_text",
    "hash_url",
    "normalize_url",
]
