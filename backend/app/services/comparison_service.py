from sqlalchemy.orm import Session

from app.models.listing import Listing
from app.models.specification import ProductSpecification
from app.services.median_service import calculate_medians
from app.services.mode_service import calculate_modes


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

    specifications = []

    for listing in listings:
        specifications.extend(listing.specifications)

    # Numeric specifications
    seller_medians = calculate_medians(specifications)

    # Most frequently reported specifications
    seller_modes = calculate_modes(specifications)

    manufacturer_specs = db.query(ProductSpecification).filter(
        ProductSpecification.product_id == product_id
    ).all()

    manufacturer_data = [
        {
            "specification_name": spec.specification_name,
            "specification_value": spec.specification_value,
        }
        for spec in manufacturer_specs
    ]

    return {
        "product_id": product_id,
        "current_listing_id": current_listing_id,
        "seller_specifications": seller_medians,
        "seller_modes": seller_modes,
        "manufacturer_specifications": manufacturer_data,
    }