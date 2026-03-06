"""URL normalization and SHA-256 hashing for cache key generation."""

import hashlib
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse


def normalize_url(url: str) -> str:
    """Normalize a URL for consistent hashing.

    - Lowercase scheme and host
    - Strip trailing slashes
    - Remove utm_*, ref, source query parameters
    - Sort remaining query parameters alphabetically
    - Strip www. prefix from host
    """
    parsed = urlparse(url.strip())
    if not parsed.scheme and not parsed.netloc:
        return url.strip().lower()

    scheme = parsed.scheme.lower() if parsed.scheme else ""
    netloc = parsed.netloc.lower() if parsed.netloc else ""
    if netloc.startswith("www."):
        netloc = netloc[4:]
    path = parsed.path.rstrip("/") or "/"
    params = parsed.params
    query = parsed.query
    fragment = parsed.fragment

    # Filter and sort query params
    if query:
        qdict = parse_qs(query, keep_blank_values=True)
        filtered = {
            k: v
            for k, v in qdict.items()
            if not (k.lower().startswith("utm_") or k.lower() in ("ref", "source"))
        }
        sorted_items = sorted(filtered.items())
        query = urlencode(sorted_items, doseq=True)
    else:
        query = ""

    return urlunparse((scheme, netloc, path, params, query, fragment))


def hash_text(text: str) -> str:
    """SHA-256 hash of any text input. Returns 64-char hex digest."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def hash_url(url: str) -> str:
    """Convenience: hash_text(normalize_url(url))."""
    return hash_text(normalize_url(url))


def hash_job_description(jd: str) -> str:
    """Convenience: hash_text(jd.strip())."""
    return hash_text(jd.strip())
