"""Tests for language_detector and resolve_language."""

from app.core.i18n import resolve_language
from app.services.language_detector import detect_language


def test_detect_language_english() -> None:
    """English CV text should return 'en'."""
    text = (
        "I am a software engineer with experience in Python and JavaScript. "
        "I have worked with the team to build scalable applications. "
        "My responsibilities include code review and mentoring. "
        "I have been with the company for three years and have contributed "
        "to many projects that have improved our product. "
        "I am looking for new opportunities to grow and learn."
    )
    assert detect_language(text) == "en"


def test_detect_language_spanish() -> None:
    """Spanish CV text should return 'es'."""
    text = (
        "Soy ingeniero de software con experiencia en Python y JavaScript. "
        "He trabajado con el equipo para construir aplicaciones escalables. "
        "Mis responsabilidades incluyen la revisión de código y la mentoría. "
        "He estado en la empresa durante tres años y he contribuido "
        "a muchos proyectos que han mejorado nuestro producto. "
        "Estoy buscando nuevas oportunidades para crecer y aprender."
    )
    assert detect_language(text) == "es"


def test_detect_language_mixed_ambiguous_returns_none() -> None:
    """Mixed or ambiguous text should return None."""
    text = (
        "The el and la of the project. "
        "I have worked with the team and the company. "
        "My responsibilities include the review. "
        "He estado en la empresa. "
        "The project has been successful."
    )
    result = detect_language(text)
    assert result is None


def test_detect_language_short_text_returns_none() -> None:
    """Text with fewer than 50 words should return None."""
    text = "I am a developer. I like Python."
    assert detect_language(text) is None


def test_detect_language_empty_returns_none() -> None:
    """Empty string should return None."""
    assert detect_language("") is None
    assert detect_language("   ") is None


def test_resolve_language_explicit_over_detected() -> None:
    """Explicit user override should take priority over detected."""
    assert resolve_language(explicit="es", detected="en", fallback="en") == "es"
    assert resolve_language(explicit="en", detected="es", fallback="es") == "en"


def test_resolve_language_detected_over_fallback() -> None:
    """Detected language should take priority over fallback when no explicit."""
    assert resolve_language(explicit=None, detected="es", fallback="en") == "es"
    assert resolve_language(explicit=None, detected="en", fallback="es") == "en"


def test_resolve_language_fallback_when_no_detected() -> None:
    """Fallback used when neither explicit nor detected available."""
    assert resolve_language(explicit=None, detected=None, fallback="en") == "en"
    assert resolve_language(explicit=None, detected=None, fallback="es") == "es"


def test_resolve_language_explicit_none_detected_valid() -> None:
    """When explicit is None and detected is valid, use detected."""
    assert resolve_language(explicit=None, detected="es", fallback="en") == "es"
