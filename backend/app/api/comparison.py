from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.comparison import ComparisonResponse
from app.services.comparison_service import get_product_comparison


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
    return get_product_comparison(
        db=db,
        product_id=product_id,
        current_listing_id=current_listing_id,
    )