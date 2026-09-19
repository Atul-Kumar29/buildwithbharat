import json
from pathlib import Path

from .exporters import export_failures, export_products
from .models import ProductRecord, ScrapeTarget
from .sources import ManufacturerSource, PublicPageFetcher, SellerSource


def load_targets(config_path: Path) -> list[ScrapeTarget]:
    payload = json.loads(config_path.read_text(encoding="utf-8"))
    return [ScrapeTarget(**item) for item in payload.get("urls", [])]


def scrape_targets(targets: list[ScrapeTarget], fetcher: PublicPageFetcher | None = None) -> tuple[list[ProductRecord], list[dict[str, str]]]:
    fetcher = fetcher or PublicPageFetcher()
    sources = {"manufacturer": ManufacturerSource(fetcher), "seller": SellerSource(fetcher)}
    records, failures = [], []
    for index, target in enumerate(targets, 1):
        print(f"[{index}/{len(targets)}] Scraping product...")
        try:
            if target.source_type not in sources:
                raise ValueError("source_type must be 'manufacturer' or 'seller'")
            record = sources[target.source_type].scrape(target)
            records.append(record)
            print(f"[OK] Product name: {record.product_name or 'unknown'}")
            print(f"[OK] Model: {record.model_number or 'unknown'}")
            print(f"[OK] Specifications: {len(record.specifications)}")
        except Exception as exc:  # one bad URL must not stop the batch
            failures.append({"url": target.url, "error": str(exc)})
            print(f"[FAILED] {target.url}: {exc}")
    return records, failures


def run(config_path: Path, output_dir: Path) -> tuple[list[ProductRecord], list[dict[str, str]]]:
    targets = load_targets(config_path)
    records, failures = scrape_targets(targets)
    json_path, _ = export_products(records, output_dir)
    export_failures(failures, output_dir)
    print(f"[SAVED] {json_path}")
    print(f"Successfully scraped: {len(records)}")
    print(f"Failed: {len(failures)}")
    print(f"Output: {json_path}")
    return records, failures