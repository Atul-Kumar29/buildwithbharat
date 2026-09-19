from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class ScrapeTarget:
    url: str
    source_type: str
    seller_name: str | None = None


@dataclass
class ProductRecord:
    product_name: str | None
    brand: str | None
    model_number: str | None
    source_type: str
    seller_name: str | None
    price: float | None
    currency: str | None
    product_url: str
    image_url: str | None
    specifications: dict[str, dict[str, str]] = field(default_factory=dict)
    scraped_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    sku: str | None = None
    mpn: str | None = None
    gtin: str | None = None
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)