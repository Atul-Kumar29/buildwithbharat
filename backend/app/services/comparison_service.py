from collections import Counter
import re

from sqlalchemy.orm import Session

from app.models.listing import Listing
from app.models.product import Product
from app.models.manufacturer_specification import ManufacturerSpecification

def normalize_value(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def get_product_comparison(
    db: Session,
    product_id: int,
    current_listing_id: int | None = None,
):
    query = db.query(Listing).filter(
        Listing.product_id == product_id
    )

    if current_listing_id is not None:
        query = query.filter(
            Listing.id != current_listing_id
        )

    listings = query.all()
    product = db.query(Product).filter(Product.id == product_id).first()
    legacy_product_records = []
    if not listings and product is not None:
        # Older seller submissions were stored as duplicate Product rows.
        # Treat matching rows as seller records until they are migrated to Listing.
        model_query = db.query(Product).filter(Product.name.ilike(product.name))
        legacy_product_records = model_query.order_by(Product.id).all()

    specifications_by_name: dict[str, list[tuple[str, str]]] = {}
    seller_data = []
    for listing in listings:
        listing_specs = []
        for spec in listing.specifications:
            name = spec.specification_name.strip().lower()
            listing_specs.append({"specification_name": name, "specification_value": spec.specification_value.strip()})
            specifications_by_name.setdefault(name, []).append((spec.specification_value.strip(), normalize_value(spec.specification_value)))
        seller_data.append({
            "listing_id": listing.id,
            "seller_name": listing.seller_name,
            "source": listing.source,
            "specifications": listing_specs,
        })

    if not listings:
        for record in legacy_product_records:
            record_specs = []
            for spec in record.specifications:
                name = spec.specification_name.strip().lower()
                record_specs.append({"specification_name": name, "specification_value": spec.specification_value.strip()})
                specifications_by_name.setdefault(name, []).append((spec.specification_value.strip(), normalize_value(spec.specification_value)))
            seller_data.append({
                "listing_id": -record.id,
                "seller_name": None,
                "source": "Product record",
                "specifications": record_specs,
            })

    seller_modes = []
    mode_lookup = {}
    for name, values in specifications_by_name.items():
        counts = Counter(normalized for _, normalized in values)
        mode_value, frequency = counts.most_common(1)[0] if values else (None, 0)
        original_value = next((original for original, normalized in values if normalized == mode_value), mode_value)
        seller_modes.append({"specification_name": name, "mode_value": original_value, "frequency": frequency})
        mode_lookup[name] = mode_value

    manufacturer_specs = db.query(ManufacturerSpecification).filter(
        ManufacturerSpecification.product_id == product_id
    ).all()



    manufacturer_data = [
        {
            "specification_name": spec.specification_name,
            "specification_value": spec.specification_value,
        }
        for spec in manufacturer_specs
    ]

    manufacturer_lookup = {
        spec["specification_name"].strip().lower(): normalize_value(spec["specification_value"])
        for spec in manufacturer_data
    }
    discrepancies = []
    for name, mode_value in mode_lookup.items():
        manufacturer_value = manufacturer_lookup.get(name)
        if manufacturer_value is not None and manufacturer_value != mode_value:
            discrepancies.append(f"{name.title()} differs from the manufacturer value")
    for listing in seller_data:
        for spec in listing["specifications"]:
            mode_value = mode_lookup.get(spec["specification_name"])
            if mode_value is not None and normalize_value(spec["specification_value"]) != mode_value:
                discrepancies.append(f"{listing['seller_name'] or 'A seller'} lists a different {spec['specification_name']}")

    return {
        "product_id": product_id,
        "current_listing_id": current_listing_id,
        "seller_listings": seller_data,
        "seller_modes": seller_modes,
        "manufacturer_specifications": manufacturer_data,
        "discrepancies": list(dict.fromkeys(discrepancies)),
    }