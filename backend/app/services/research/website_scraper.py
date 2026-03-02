"""Company website scraper extracting key pages using httpx and BeautifulSoup."""

from __future__ import annotations

import asyncio
import ipaddress
import re
import socket
from typing import Optional
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

from app.models.schemas import WebsiteContent


class WebsiteScraper:
    """Scrapes company website for about/careers/values/blog/leadership content."""

    CANDIDATE_PATHS: dict[str, list[str]] = {
        "about": ["/about", "/about-us", "/company"],
        "careers": ["/careers", "/jobs"],
        "values": ["/values", "/culture", "/mission"],
        "leadership": ["/team", "/leadership"],
    }
    BLOG_PATH: str = "/blog"
    USER_AGENT: str = "ATSCareerKit/1.0 (career-research)"
    REQUEST_TIMEOUT: float = 5.0
    MAX_PAGE_SIZE: int = 500_000
    INTER_REQUEST_DELAY: float = 0.5
    MAX_PAGES: int = 5
    MAX_BLOG_POSTS: int = 3
    MAX_URL_LENGTH: int = 2048
    BLOCKED_NETWORKS = [
        ipaddress.ip_network("127.0.0.0/8"),
        ipaddress.ip_network("10.0.0.0/8"),
        ipaddress.ip_network("172.16.0.0/12"),
        ipaddress.ip_network("192.168.0.0/16"),
        ipaddress.ip_network("169.254.0.0/16"),
        ipaddress.ip_network("::1/128"),
    ]

    async def scrape(self, base_url: str) -> WebsiteContent:
        """Scrape key site sections while enforcing polite single-domain limits."""
        normalized_base_url = self._normalize_base_url(base_url)
        if not normalized_base_url:
            return WebsiteContent()

        content = WebsiteContent()
        fetched_pages = 0

        for section, paths in self.CANDIDATE_PATHS.items():
            for path in paths:
                if fetched_pages >= self.MAX_PAGES:
                    break
                text = await self._fetch_with_delay(urljoin(normalized_base_url, path))
                fetched_pages += 1
                if not text:
                    continue
                setattr(content, section, text)
                break

        if fetched_pages < self.MAX_PAGES:
            blog_text = await self._fetch_with_delay(
                urljoin(normalized_base_url, self.BLOG_PATH)
            )
            if blog_text:
                content.blog_posts = self._extract_blog_posts(blog_text)

        content.raw_text_length = self._calculate_raw_text_length(content)
        return content

    async def _fetch_with_delay(self, url: str) -> Optional[str]:  # noqa: UP045
        """Fetch page and delay before returning result for polite pacing."""
        page = await self._fetch_page(url)
        await asyncio.sleep(self.INTER_REQUEST_DELAY)
        return page

    async def _fetch_page(self, url: str) -> Optional[str]:  # noqa: UP045
        """Fetch and clean page text, returning None on failures."""
        try:
            if self._is_internal_url(url):
                return None
            timeout = httpx.Timeout(self.REQUEST_TIMEOUT)
            headers = {"User-Agent": self.USER_AGENT}
            async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
                response = await client.get(url, follow_redirects=False)
                if 300 <= response.status_code < 400:
                    return None
                response.raise_for_status()

            content_length_header = response.headers.get("Content-Length")
            if content_length_header and (
                int(content_length_header) > self.MAX_PAGE_SIZE
            ):
                return None
            if len(response.content) > self.MAX_PAGE_SIZE:
                return None

            soup = BeautifulSoup(response.text, "html.parser")
            for tag in ("script", "style", "nav", "footer", "header"):
                for node in soup.find_all(tag):
                    node.decompose()

            body = soup.body or soup
            text = body.get_text(separator=" ", strip=True)
            cleaned_text = re.sub(r"\s+", " ", text).strip()
            return cleaned_text or None
        except Exception:
            return None

    @staticmethod
    def _is_internal_url(url: str) -> bool:
        """Return True when URL resolves to a private/loopback network."""
        try:
            hostname = urlparse(url).hostname
            if not hostname:
                return True
            addr = socket.getaddrinfo(hostname, None)[0][4][0]
            ip = ipaddress.ip_address(addr)
            return any(ip in network for network in WebsiteScraper.BLOCKED_NETWORKS)
        except (socket.gaierror, ValueError):
            return True

    def _extract_blog_posts(self, blog_text: str) -> list[str]:
        """Return at most the latest configured blog text excerpts."""
        candidates = [chunk.strip() for chunk in re.split(r"[.\n]+", blog_text)]
        filtered = [chunk for chunk in candidates if len(chunk) > 20]
        return filtered[: self.MAX_BLOG_POSTS]

    def _normalize_base_url(self, base_url: str) -> Optional[str]:  # noqa: UP045
        """Normalize input URL and ensure it has http(s) scheme/netloc."""
        trimmed = base_url.strip()
        if not trimmed:
            return None
        if len(trimmed) > self.MAX_URL_LENGTH:
            return None

        parsed = urlparse(trimmed)
        if not parsed.scheme:
            trimmed = f"https://{trimmed}"
            parsed = urlparse(trimmed)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            return None
        return f"{parsed.scheme}://{parsed.netloc}"

    def _calculate_raw_text_length(self, content: WebsiteContent) -> int:
        """Compute total characters across extracted website sections."""
        total = 0
        texts = [content.about, content.careers, content.values, content.leadership]
        for text in texts:
            if text:
                total += len(text)
        for post in content.blog_posts:
            total += len(post)
        return total
