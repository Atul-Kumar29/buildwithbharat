from ..models import ProductRecord, ScrapeTarget
from ..parser import parse_product
from .base import PublicPageFetcher


class SellerSource:
    def __init__(self, fetcher: PublicPageFetcher):
        self.fetcher = fetcher

    def scrape(self, target: ScrapeTarget) -> ProductRecord:
        return parse_product(self.fetcher.fetch(target.url), target)