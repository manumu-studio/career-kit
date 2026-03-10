"""Heuristic language detection for CV text (English vs Spanish, no LLM cost)."""

from __future__ import annotations

import re

from app.core.i18n import Locale

SPANISH_STOPWORDS = frozenset(
    [
        "el",
        "la",
        "los",
        "las",
        "de",
        "en",
        "que",
        "por",
        "con",
        "para",
        "del",
        "al",
        "una",
        "uno",
        "como",
        "pero",
        "sobre",
        "entre",
        "desde",
        "hasta",
        "también",
        "más",
        "muy",
        "sin",
        "cada",
        "otro",
        "esta",
        "este",
        "ese",
        "su",
        "sus",
    ]
)

ENGLISH_STOPWORDS = frozenset(
    [
        "the",
        "and",
        "of",
        "to",
        "in",
        "is",
        "for",
        "with",
        "that",
        "was",
        "are",
        "been",
        "have",
        "has",
        "from",
        "this",
        "will",
        "can",
        "but",
        "not",
        "all",
        "which",
        "their",
        "were",
        "they",
        "would",
        "each",
        "make",
        "like",
    ]
)

MIN_WORDS_THRESHOLD = 50


def _tokenize(text: str) -> list[str]:
    """Extract lowercase word tokens from text."""
    normalized = re.sub(r"[^\w\s]", " ", text.lower())
    return [w for w in normalized.split() if len(w) > 1]


def detect_language(text: str) -> Locale | None:
    """Detect whether text is primarily English or Spanish using stopword counts.

    Uses a heuristic based on common stopword frequency. No LLM calls.

    Args:
        text: Extracted CV or document text.

    Returns:
        'en' if English-dominant, 'es' if Spanish-dominant, None if ambiguous
        or text too short (< 50 words).
    """
    if not text or not text.strip():
        return None

    tokens = _tokenize(text)
    if len(tokens) < MIN_WORDS_THRESHOLD:
        return None

    spanish_count = sum(1 for t in tokens if t in SPANISH_STOPWORDS)
    english_count = sum(1 for t in tokens if t in ENGLISH_STOPWORDS)
    total = spanish_count + english_count

    if total == 0:
        return None

    ratio = spanish_count / total
    if ratio > 0.6:
        return "es"
    if ratio < 0.4:
        return "en"
    return None
