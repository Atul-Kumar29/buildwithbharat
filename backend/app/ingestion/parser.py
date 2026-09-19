import json
import re
from collections.abc import Iterable
from typing import Any
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from .models import ProductRecord, ScrapeTarget
from .normalizer import normalize_key, normalize_specification


def _first(value: Any) -> Any:
    return value[0] if isinstance(value, list) and value else value


def _text(value: Any) -> str | None:
    if isinstance(value, dict):
        value = value.get("name") or value.get("value")
    if value is None:
        return None
    result = " ".join(str(value).split()).strip()
    return result or None


def _find_product_json_ld(soup: BeautifulSoup) -> dict[str, Any]:
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            payload = json.loads(script.string or script.get_text())
        except (TypeError, json.JSONDecodeError):
            continue
        candidates = payload if isinstance(payload, list) else payload.get("@graph", [payload]) if isinstance(payload, dict) else []
        for candidate in candidates:
            if isinstance(candidate, dict) and (
                candidate.get("@type") == "Product" or "Product" in candidate.get("@type", [])
            ):
                return candidate
    return {}


def _meta(soup: BeautifulSoup, *names: str) -> str | None:
    for name in names:
        tag = soup.find("meta", attrs={"name": name}) or soup.find("meta", attrs={"property": name})
        if tag and tag.get("content"):
            return _text(tag["content"])
    return None


def _table_label_value_pairs(soup: BeautifulSoup) -> Iterable[tuple[str, str]]:
    for row in soup.select("tr"):
        cells = row.find_all(["th", "td"], recursive=False)
        if len(cells) < 2 or cells[-1].name == "th":
            continue
        # Multi-level specification tables use category, label, value columns.
        # The last two cells are the actual label/value pair.
        if len(cells) == 2:
            category_cell, label_cell, value_cell = cells[0], cells[0], cells[1]
        elif not cells[-1].get_text(" ", strip=True):
            category_cell, label_cell, value_cell = cells[0], cells[0], cells[1]
        else:
            category_cell, label_cell, value_cell = cells[-3], cells[-2], cells[-1]
        label = label_cell.get_text(" ", strip=True)
        value = value_cell.get_text(" ", strip=True)
        if normalize_key(label) in {"name", "value"}:
            label = category_cell.get_text(" ", strip=True)
        if label and value:
            yield label, value


def _label_value_pairs(soup: BeautifulSoup) -> Iterable[tuple[str, str]]:
    yield from _table_label_value_pairs(soup)
    for item in soup.select("dl"):
        terms, definitions = item.find_all("dt"), item.find_all("dd")
        yield from ((term.get_text(" ", strip=True), definition.get_text(" ", strip=True)) for term, definition in zip(terms, definitions))
    for item in soup.select("li"):
        text = item.get_text(" ", strip=True)
        match = re.match(r"^([^:]{2,80}):\s*(.+)$", text)
        if match:
            yield match.group(1), match.group(2)


def _parse_price(value: Any) -> tuple[float | None, str | None]:
    if isinstance(value, dict):
        value = value.get("price")
    if value is None:
        return None, None
    text = str(value).replace(",", "")
    match = re.search(r"\d+(?:\.\d+)?", text)
    if not match:
        return None, None
    currency = None
    for symbol, code in (("₹", "INR"), ("$", "USD"), ("€", "EUR"), ("£", "GBP")):
        if symbol in str(value):
            currency = code
            break
    return float(match.group()), currency


def _is_gtin(value: str | None) -> bool:
    return bool(value and re.fullmatch(r"\d{8}|\d{12,14}", value.strip()))


def _identifier_from_pairs(pairs: Iterable[tuple[str, str]]) -> dict[str, str]:
    identifiers: dict[str, str] = {}
    for name, value in pairs:
        key = normalize_key(name)
        value = value.strip()
        if not value:
            continue
        if key in {"model", "model_number", "model_no", "model_number_"}:
            identifiers.setdefault("model_number", value)
        elif key == "sku":
            identifiers.setdefault("sku", value)
        elif key in {"mpn", "manufacturer_part_number"}:
            identifiers.setdefault("mpn", value)
        elif key in {"ean", "upc", "gtin", "gtin13", "gtin12", "gtin14", "gtin8"}:
            identifiers.setdefault("gtin", value)
    return identifiers


def parse_product(html: str, target: ScrapeTarget) -> ProductRecord:
    soup = BeautifulSoup(html, "lxml")
    product = _find_product_json_ld(soup)
    offers = _first(product.get("offers")) if isinstance(product, dict) else {}
    brand = _text(product.get("brand")) or _meta(soup, "brand", "product:brand")
    heading = soup.find("h1")
    product_name = _text(product.get("name")) or _meta(soup, "og:title", "twitter:title") or (_text(heading.get_text()) if heading else None)
    price, currency = _parse_price(offers)
    if price is None:
        price, currency = _parse_price(_meta(soup, "product:price:amount", "price"))
    currency = currency or _text(offers.get("priceCurrency")) if isinstance(offers, dict) else currency
    if not currency:
        currency = _meta(soup, "product:price:currency", "currency")

    values: dict[str, dict[str, str]] = {}
    for name, value in _label_value_pairs(soup):
        key, raw = normalize_key(name), " ".join(value.split())
        if key and raw and key not in values:
            values[key] = {"raw_value": raw, "normalized_value": normalize_specification(raw)}
    for item in product.get("additionalProperty", []) if isinstance(product, dict) else []:
        if isinstance(item, dict) and item.get("name") and item.get("value") is not None:
            raw = _text(item["value"]) or ""
            values.setdefault(normalize_key(item["name"]), {"raw_value": raw, "normalized_value": normalize_specification(raw)})

    model_number = _text(product.get("model"))
    sku = _text(product.get("sku"))
    mpn = _text(product.get("mpn"))
    gtin = _text(product.get("gtin13") or product.get("gtin12") or product.get("gtin14") or product.get("gtin8"))
    table_identifiers = _identifier_from_pairs(_label_value_pairs(soup))
    model_number = model_number or table_identifiers.get("model_number")
    sku = sku or table_identifiers.get("sku")
    mpn = mpn or table_identifiers.get("mpn")
    gtin = gtin or table_identifiers.get("gtin")

    # A numeric model/MPN with GTIN length is a product code, not a model.
    for identifier_name in ("model_number", "mpn"):
        identifier = model_number if identifier_name == "model_number" else mpn
        if _is_gtin(identifier):
            gtin = gtin or identifier
            if identifier_name == "model_number":
                model_number = None
            else:
                mpn = None
    if model_number is None and mpn and not _is_gtin(mpn):
        model_number = mpn

    image = _first(product.get("image")) if isinstance(product, dict) else None
    image_url = urljoin(target.url, image or _meta(soup, "og:image")) if image or _meta(soup, "og:image") else None
    return ProductRecord(
        product_name=product_name,
        brand=brand,
        model_number=model_number,
        source_type=target.source_type,
        seller_name=target.seller_name if target.source_type == "seller" else None,
        price=price,
        currency=currency,
        product_url=target.url,
        image_url=image_url,
        specifications=values,
        sku=sku,
        mpn=mpn,
        gtin=gtin,
    )