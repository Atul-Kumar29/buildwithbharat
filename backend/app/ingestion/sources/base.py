from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import requests


class FetchError(RuntimeError):
    pass


class PublicPageFetcher:
    def __init__(self, timeout: float = 20.0, user_agent: str = "BuildWithBharatCatalogBot/1.0"):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": user_agent, "Accept": "text/html,application/xhtml+xml"})

    def _allowed_by_robots(self, url: str) -> bool:
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        parser = RobotFileParser(robots_url)
        try:
            response = self.session.get(robots_url, timeout=self.timeout)
            if response.status_code == 404:
                return True
            response.raise_for_status()
            parser.parse(response.text.splitlines())
            return parser.can_fetch(self.session.headers["User-Agent"], url)
        except requests.RequestException:
            return True

    def fetch(self, url: str) -> str:
        if not self._allowed_by_robots(url):
            raise FetchError("robots.txt disallows this URL")
        try:
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
        except requests.RequestException as exc:
            raise FetchError(f"request failed: {exc}") from exc
        return response.text