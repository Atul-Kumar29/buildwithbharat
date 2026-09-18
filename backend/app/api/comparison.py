from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.comparison import ComparisonResponse
from app.services.comparison_service import get_product_comparison
from app.services.cache_service import get_json, set_json


router = APIRouter(
    prefix="/api/comparison",
    tags=["Comparison"],
)


@router.get(
    "/products/{product_id}",
    response_model=ComparisonResponse,
)
def compare_product(
    product_id: int,
    current_listing_id: int | None = None,
    db: Session = Depends(get_db),
):
    cache_key = f"comparison:{product_id}:{current_listing_id or 'all'}"
    cached = get_json(cache_key)
    if cached is not None:
        return cached
    data = get_product_comparison(
        db=db,
        product_id=product_id,
        current_listing_id=current_listing_id,
    )
    set_json(cache_key, data, ttl=300)
    return data