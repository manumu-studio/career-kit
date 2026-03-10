"""Locale and translated error messages for API responses."""

from typing import Literal, Optional

Locale = Literal["en", "es"]


def resolve_language(
    explicit: Optional[Locale] = None,
    detected: Optional[Locale] = None,
    fallback: Locale = "en",
) -> Locale:
    """Resolve output language with priority: explicit override > detected > fallback.

    Args:
        explicit: User override (e.g. from language switcher).
        detected: Language detected from CV text.
        fallback: Default when neither explicit nor detected available.

    Returns:
        Resolved locale.
    """
    if explicit in ("en", "es"):
        return explicit
    if detected in ("en", "es"):
        return detected
    return fallback


LANGUAGE_NAMES: dict[Locale, str] = {
    "en": "English",
    "es": "Spanish",
}

ERROR_MESSAGES: dict[Locale, dict[str, str]] = {
    "en": {
        "invalid_pdf": "Uploaded file must be a PDF.",
        "file_empty": "Uploaded file is empty.",
        "file_too_large": "File exceeds maximum size of {max_mb} MB.",
        "file_not_pdf": "Uploaded file is not a valid PDF.",
        "pdf_no_pages": "PDF contains no pages.",
        "pdf_parse_failed": "Failed to parse PDF file.",
        "no_extractable_text": "No extractable text found in PDF.",
        "invalid_company_context": "Invalid company context payload: {detail}",
        "llm_parse_failed": "Failed to parse LLM response: {detail}",
        "llm_provider_failed": "LLM provider request failed.",
        "cover_letter_failed": "Cover letter generation failed.",
        "unknown_provider": "Unknown provider '{name}'. Available: {available}",
        "at_least_2_providers": (
            "At least 2 providers required (e.g. anthropic,openai)."
        ),
        "research_timed_out": "Research timed out.",
        "insufficient_data": "Insufficient data to research this company.",
        "research_synthesis_failed": "Research synthesis failed.",
    },
    "es": {
        "invalid_pdf": "El archivo debe ser un PDF.",
        "file_empty": "El archivo subido está vacío.",
        "file_too_large": "El archivo supera el tamaño máximo de {max_mb} MB.",
        "file_not_pdf": "El archivo subido no es un PDF válido.",
        "pdf_no_pages": "El PDF no contiene páginas.",
        "pdf_parse_failed": "Error al analizar el archivo PDF.",
        "no_extractable_text": "No se encontró texto extraíble en el PDF.",
        "invalid_company_context": "Payload de contexto de empresa inválido: {detail}",
        "llm_parse_failed": "Error al analizar la respuesta del LLM: {detail}",
        "llm_provider_failed": "Error en la solicitud al proveedor LLM.",
        "cover_letter_failed": "Error al generar la carta de presentación.",
        "unknown_provider": "Proveedor desconocido '{name}'. Disponibles: {available}",
        "at_least_2_providers": (
            "Se requieren al menos 2 proveedores (ej. anthropic,openai)."
        ),
        "research_timed_out": "La investigación ha expirado.",
        "insufficient_data": "Datos insuficientes para investigar esta empresa.",
        "research_synthesis_failed": "Error en la síntesis de la investigación.",
    },
}


def get_error_message(locale: Locale, key: str, **kwargs: str) -> str:
    """Return translated error message, falling back to English if key missing."""
    messages = ERROR_MESSAGES.get(locale, ERROR_MESSAGES["en"])
    template = messages.get(key, ERROR_MESSAGES["en"].get(key, key))
    return template.format(**kwargs) if kwargs else template


def normalize_locale(value: Optional[str] = None) -> Locale:  # noqa: UP007
    """Normalize locale string to supported Locale, defaulting to 'en'."""
    if value in ("en", "es"):
        return value  # type: ignore[return-value]
    return "en"
