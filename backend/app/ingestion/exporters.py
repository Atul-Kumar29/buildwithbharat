import csv
import json
from pathlib import Path

from .models import ProductRecord


def export_products(records: list[ProductRecord], output_dir: Path) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path, csv_path = output_dir / "products.json", output_dir / "products.csv"
    json_path.write_text(json.dumps([record.to_dict() for record in records], indent=2), encoding="utf-8")
    fields = list(records[0].to_dict()) if records else list(ProductRecord(None, None, None, "seller", None, None, None, "", None).to_dict())
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for record in records:
            row = record.to_dict()
            row["specifications"] = json.dumps(row["specifications"], ensure_ascii=True)
            writer.writerow(row)
    return json_path, csv_path


def export_failures(failures: list[dict[str, str]], output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / "failures.json"
    path.write_text(json.dumps(failures, indent=2), encoding="utf-8")
    return path