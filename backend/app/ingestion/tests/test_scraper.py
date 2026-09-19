from pathlib import Path
from unittest.mock import Mock

import pytest
import requests

from app.ingestion.models import ScrapeTarget
from app.ingestion.normalizer import normalize_specification
from app.ingestion.parser import parse_product
from app.ingestion.sources.base import FetchError, PublicPageFetcher


FIXTURE = Path(__file__).parent / "fixtures" / "electronics_product.html"
TABLE_FIXTURE = Path(__file__).parent / "fixtures" / "specification_tables.html"
LCSC_FIXTURE = Path(__file__).parent / "fixtures" / "lcsc_specifications.html"


def fixture_html() -> str:
    return FIXTURE.read_text(encoding="utf-8")


def read_fixture(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_parser_extracts_product_fields_and_specs():
    record = parse_product(fixture_html(), ScrapeTarget("https://example.test/p", "seller", "Example Seller"))
    assert record.product_name == "Acme Pro 16 Laptop"
    assert record.brand == "Acme"
    assert record.model_number == "AP16-2026"
    assert record.price == 62999
    assert record.currency == "INR"
    assert record.image_url == "https://example.test/images/acme-pro-16.jpg"
    assert record.specifications["ram"] == {"raw_value": "16GB", "normalized_value": "16 GB"}
    assert record.specifications["storage"]["normalized_value"] == "512 GB SSD"
    assert record.specifications["processor"]["normalized_value"] == "Intel Core i5-13420H"
    assert record.specifications["display"]["normalized_value"] == "15.6 inch"
    assert record.specifications["weight"]["normalized_value"] == "1.65 kg"


def test_normalization_keeps_unknown_values_and_handles_missing_fields():
    assert normalize_specification("512GB SSD") == "512 GB SSD"
    assert normalize_specification("16 GB RAM") == "16 GB"
    assert normalize_specification("Integrated Bluetooth function") == "Integrated Bluetooth function"
    record = parse_product(
        "<html><body><h1>Unnamed Product</h1><table><tr><th>RAM</th><td>8GB</td></tr></table></body></html>",
        ScrapeTarget("https://example.test", "manufacturer"),
    )
    assert record.product_name == "Unnamed Product"
    assert record.price is None
    assert record.model_number is None
    assert record.seller_name is None


def test_parser_uses_actual_values_in_header_value_tables():
    record = parse_product(read_fixture(TABLE_FIXTURE), ScrapeTarget("https://example.test", "manufacturer"))
    assert record.specifications["ram"]["raw_value"] == "16GB"
    assert record.specifications["board"]["raw_value"] == "Arduino UNO R4 WiFi"
    assert record.specifications["digital_io_pins"]["raw_value"] == "14"
    assert record.specifications["circuit_operating_voltage"]["raw_value"] == "5 V"
    assert record.specifications["width"]["raw_value"] == "68.85 mm"
    assert "pins" not in record.specifications


def test_parser_handles_lcsc_style_tables_without_header_values():
    record = parse_product(read_fixture(LCSC_FIXTURE), ScrapeTarget("https://example.test", "seller", "LCSC"))
    assert record.specifications["operating_voltage"]["raw_value"] == "5 V"
    assert record.specifications["wifi"]["raw_value"] == "802.11 b/g/n"
    assert record.specifications["availability"]["raw_value"] == "In stock"
    assert "type" not in record.specifications


def test_parser_separates_sku_mpn_and_gtin():
    html = """
    <html><script type="application/ld+json">
    {"@type":"Product","name":"Board","sku":"ABX00087","model":"7630049204591","mpn":"7630049204591","gtin13":"7630049204591"}
    </script></html>
    """
    record = parse_product(html, ScrapeTarget("https://example.test", "manufacturer"))
    assert record.sku == "ABX00087"
    assert record.model_number is None
    assert record.mpn is None
    assert record.gtin == "7630049204591"

    seller_html = """
    <html><script type="application/ld+json">
    {"@type":"Product","name":"Board","mpn":"ABX00087"}
    </script></html>
    """
    seller_record = parse_product(seller_html, ScrapeTarget("https://example.test", "seller", "Example Seller"))
    assert seller_record.model_number == "ABX00087"
    assert seller_record.mpn == "ABX00087"
    assert seller_record.gtin is None


def test_parser_handles_malformed_html():
    record = parse_product("<html><h1>Broken Product<table><tr><th>RAM<td>8GB", ScrapeTarget("https://example.test", "manufacturer"))
    assert record.product_name == "Broken Product"
    assert record.specifications["ram"]["normalized_value"] == "8 GB"


def test_fetcher_reports_failed_requests():
    fetcher = PublicPageFetcher()
    fetcher._allowed_by_robots = Mock(return_value=True)
    fetcher.session.get = Mock(side_effect=requests.Timeout("timed out"))
    with pytest.raises(FetchError, match="request failed"):
        fetcher.fetch("https://example.test/product")


@pytest.mark.parametrize("error", [
    requests.HTTPError("403 Client Error"),
    requests.HTTPError("404 Client Error"),
    requests.HTTPError("500 Server Error"),
    requests.Timeout("timed out"),
    requests.ConnectionError("connection refused"),
])
def test_fetcher_reports_http_and_network_failures(error):
    fetcher = PublicPageFetcher()
    fetcher._allowed_by_robots = Mock(return_value=True)
    fetcher.session.get = Mock(side_effect=error)
    with pytest.raises(FetchError, match="request failed"):
        fetcher.fetch("https://example.test/product")