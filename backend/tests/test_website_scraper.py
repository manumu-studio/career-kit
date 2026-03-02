"""Unit tests for WebsiteScraper service.

Validates scraping behavior, fallback paths, and guardrails.
"""

from __future__ import annotations

import os
from collections.abc import Callable
from dataclasses import dataclass, field

import httpx
import pytest

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from app.services.research.website_scraper import WebsiteScraper


@dataclass
class _MockResponse:
    """Simple response double compatible with scraper expectations."""

    text: str
    status_code: int = 200
    headers: dict[str, str] = field(default_factory=dict)

    @property
    def content(self) -> bytes:
        """Return encoded content for size checks."""
        return self.text.encode("utf-8")

    def raise_for_status(self) -> None:
        """Raise httpx status error when response is non-success."""
        if self.status_code >= 400:
            raise httpx.HTTPStatusError(
                "Mock status error",
                request=httpx.Request("GET", "https://example.com"),
                response=httpx.Response(self.status_code),
            )


def _mock_html(body_text: str) -> str:
    """Wrap body text in minimal valid HTML markup."""
    return f"<html><body>{body_text}</body></html>"


def _mock_async_client(
    route_resolver: Callable[[str], _MockResponse | Exception],
    observed_urls: list[str],
) -> type:
    """Create an AsyncClient replacement using the provided URL resolver."""

    class _FakeAsyncClient:
        def __init__(self, *_: object, **__: object) -> None:
            pass

        async def __aenter__(self) -> _FakeAsyncClient:
            return self

        async def __aexit__(
            self,
            exc_type: type[BaseException] | None,
            exc: BaseException | None,
            tb: object | None,
        ) -> bool:
            _ = (exc_type, exc, tb)
            return False

        async def get(self, url: str, follow_redirects: bool = False) -> _MockResponse:
            _ = follow_redirects
            observed_urls.append(url)
            resolved = route_resolver(url)
            if isinstance(resolved, Exception):
                raise resolved
            return resolved

    return _FakeAsyncClient


@pytest.fixture
def scraper(monkeypatch: pytest.MonkeyPatch) -> WebsiteScraper:
    """Build a scraper with inter-request delay disabled for fast tests."""
    monkeypatch.setattr(WebsiteScraper, "INTER_REQUEST_DELAY", 0.0)
    return WebsiteScraper()


@pytest.mark.asyncio
async def test_scrape_about_page(
    scraper: WebsiteScraper, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Scraper stores about-page content and computes non-zero total length."""
    observed_urls: list[str] = []

    def _resolve(url: str) -> _MockResponse:
        if url.endswith("/about"):
            return _MockResponse(_mock_html("We are a great company"))
        return _MockResponse("", status_code=404)

    monkeypatch.setattr(
        "app.services.research.website_scraper.httpx.AsyncClient",
        _mock_async_client(_resolve, observed_urls),
    )

    content = await scraper.scrape("https://example.com")

    assert content.about is not None
    assert "We are a great company" in content.about
    assert content.raw_text_length > 0


@pytest.mark.asyncio
async def test_scrape_fallback_paths(
    scraper: WebsiteScraper, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Scraper should fall back from /about to /about-us when needed."""
    observed_urls: list[str] = []

    def _resolve(url: str) -> _MockResponse:
        if url.endswith("/about"):
            return _MockResponse("", status_code=404)
        if url.endswith("/about-us"):
            return _MockResponse(_mock_html("Our story"))
        return _MockResponse("", status_code=404)

    monkeypatch.setattr(
        "app.services.research.website_scraper.httpx.AsyncClient",
        _mock_async_client(_resolve, observed_urls),
    )

    content = await scraper.scrape("https://example.com")

    assert content.about is not None
    assert "Our story" in content.about
    assert any(url.endswith("/about") for url in observed_urls)
    assert any(url.endswith("/about-us") for url in observed_urls)


@pytest.mark.asyncio
async def test_scrape_careers_page(
    scraper: WebsiteScraper, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Scraper should capture careers content when available."""
    observed_urls: list[str] = []

    def _resolve(url: str) -> _MockResponse:
        if url.endswith("/careers"):
            return _MockResponse(_mock_html("Join our team"))
        return _MockResponse("", status_code=404)

    monkeypatch.setattr(
        "app.services.research.website_scraper.httpx.AsyncClient",
        _mock_async_client(_resolve, observed_urls),
    )

    content = await scraper.scrape("https://example.com")

    assert content.careers is not None
    assert "Join our team" in content.careers


@pytest.mark.asyncio
async def test_scrape_values_page(
    scraper: WebsiteScraper, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Scraper should capture values content when available."""
    observed_urls: list[str] = []

    def _resolve(url: str) -> _MockResponse:
        if url.endswith("/about"):
            return _MockResponse(_mock_html("About text"))
        if url.endswith("/careers"):
            return _MockResponse(_mock_html("Careers text"))
        if url.endswith("/values"):
            return _MockResponse(_mock_html("Innovation and integrity"))
        return _MockResponse("", status_code=404)

    monkeypatch.setattr(
        "app.services.research.website_scraper.httpx.AsyncClient",
        _mock_async_client(_resolve, observed_urls),
    )

    content = await scraper.scrape("https://example.com")

    assert content.values is not None
    assert "Innovation and integrity" in content.values


@pytest.mark.asyncio
async def test_scrape_blog_posts(
    scraper: WebsiteScraper, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Blog extraction should return only the latest configured number of posts."""
    observed_urls: list[str] = []
    blog_body = ". ".join(
        [
            "This is a long blog sentence number one for testing",
            "This is a long blog sentence number two for testing",
            "This is a long blog sentence number three for testing",
            "This is a long blog sentence number four for testing",
            "This is a long blog sentence number five for testing",
        ]
    )

    def _resolve(url: str) -> _MockResponse:
        if url.endswith("/about"):
            return _MockResponse(_mock_html("About text here"))
        if url.endswith("/careers"):
            return _MockResponse(_mock_html("Careers text"))
        if url.endswith("/values"):
            return _MockResponse(_mock_html("Values text"))
        if url.endswith("/team"):
            return _MockResponse(_mock_html("Leadership text"))
        if url.endswith("/blog"):
            return _MockResponse(_mock_html(blog_body))
        return _MockResponse("", status_code=404)

    monkeypatch.setattr(
        "app.services.research.website_scraper.httpx.AsyncClient",
        _mock_async_client(_resolve, observed_urls),
    )

    content = await scraper.scrape("https://example.com")

    assert len(content.blog_posts) == 3
    assert all(len(post) > 20 for post in content.blog_posts)


@pytest.mark.asyncio
async def test_timeout_handling(
    scraper: WebsiteScraper, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Single-page timeout should not break scraping of other sections."""
    observed_urls: list[str] = []

    def _resolve(url: str) -> _MockResponse | Exception:
        if url.endswith("/about"):
            return httpx.TimeoutException("timeout")
        if url.endswith("/careers"):
            return _MockResponse(_mock_html("Join our team"))
        return _MockResponse("", status_code=404)

    monkeypatch.setattr(
        "app.services.research.website_scraper.httpx.AsyncClient",
        _mock_async_client(_resolve, observed_urls),
    )

    content = await scraper.scrape("https://example.com")

    assert content.about is None
    assert content.careers is not None


@pytest.mark.asyncio
async def test_large_page_skip(
    scraper: WebsiteScraper, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Pages above configured max size should be ignored."""
    observed_urls: list[str] = []

    def _resolve(url: str) -> _MockResponse:
        if url.endswith("/about"):
            return _MockResponse(
                _mock_html("ignored"),
                headers={"Content-Length": str(WebsiteScraper.MAX_PAGE_SIZE + 1)},
            )
        if url.endswith("/careers"):
            return _MockResponse(_mock_html("Join our team"))
        return _MockResponse("", status_code=404)

    monkeypatch.setattr(
        "app.services.research.website_scraper.httpx.AsyncClient",
        _mock_async_client(_resolve, observed_urls),
    )

    content = await scraper.scrape("https://example.com")

    assert content.about is None
    assert content.careers is not None


@pytest.mark.asyncio
async def test_invalid_and_internal_url_blocked(scraper: WebsiteScraper) -> None:
    """Invalid and internal/private URLs should return empty content."""
    empty_content = await scraper.scrape("")
    invalid_content = await scraper.scrape("not-a-url")
    internal_content = await scraper.scrape("http://127.0.0.1")
    too_long_content = await scraper.scrape(f"https://example.com/{'x' * 2100}")

    assert empty_content.raw_text_length == 0
    assert invalid_content.raw_text_length == 0
    assert internal_content.raw_text_length == 0
    assert too_long_content.raw_text_length == 0


@pytest.mark.asyncio
async def test_html_cleanup(
    scraper: WebsiteScraper, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Parser should remove noisy tags and preserve meaningful text."""
    observed_urls: list[str] = []
    html = (
        "<html><body><script>alert('xss')</script><nav>Menu</nav>"
        "<style>.x{}</style><p>Real content</p></body></html>"
    )

    def _resolve(url: str) -> _MockResponse:
        if url.endswith("/about"):
            return _MockResponse(html)
        return _MockResponse("", status_code=404)

    monkeypatch.setattr(
        "app.services.research.website_scraper.httpx.AsyncClient",
        _mock_async_client(_resolve, observed_urls),
    )

    content = await scraper.scrape("https://example.com")

    assert content.about is not None
    assert "Real content" in content.about
    assert "alert" not in content.about
    assert "Menu" not in content.about
    assert ".x" not in content.about


@pytest.mark.asyncio
async def test_max_pages_limit(
    scraper: WebsiteScraper, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Scraper should never issue more requests than MAX_PAGES."""
    observed_urls: list[str] = []

    def _resolve(url: str) -> _MockResponse:
        _ = url
        return _MockResponse(_mock_html("always available page text"))

    monkeypatch.setattr(
        "app.services.research.website_scraper.httpx.AsyncClient",
        _mock_async_client(_resolve, observed_urls),
    )

    await scraper.scrape("https://example.com")

    assert len(observed_urls) <= WebsiteScraper.MAX_PAGES


@pytest.mark.asyncio
async def test_raw_text_length(
    scraper: WebsiteScraper, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Raw text length should sum extracted website section character counts."""
    observed_urls: list[str] = []

    def _resolve(url: str) -> _MockResponse:
        if url.endswith("/about"):
            return _MockResponse(_mock_html("Hello"))
        if url.endswith("/careers"):
            return _MockResponse(_mock_html("World"))
        return _MockResponse("", status_code=404)

    monkeypatch.setattr(
        "app.services.research.website_scraper.httpx.AsyncClient",
        _mock_async_client(_resolve, observed_urls),
    )

    content = await scraper.scrape("https://example.com")

    assert content.raw_text_length == 10
